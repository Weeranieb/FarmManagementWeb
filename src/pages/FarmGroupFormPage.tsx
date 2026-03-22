import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { th } from '../locales/th'
import { useClient } from '../contexts/ClientContext'
import { useFarmGroupQuery, farmGroupKeys } from '../hooks/useFarmGroup'
import { useFarmListQuery } from '../hooks/useFarm'
import {
  farmGroupApi,
  type CreateFarmGroupRequest,
  type UpdateFarmGroupRequest,
} from '../api/farmGroup'

const L = th.farmGroups

type FarmRow = { id: number; name: string }

type FarmGroupFormFieldsProps = {
  initialName: string
  initialFarmIds: number[]
  farms: FarmRow[]
  clientId: number | undefined
  isEdit: boolean
  groupId: number | undefined
}

function FarmGroupFormFields({
  initialName,
  initialFarmIds,
  farms,
  clientId,
  isEdit,
  groupId,
}: FarmGroupFormFieldsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState(initialName)
  const [selectedFarmIds, setSelectedFarmIds] = useState(initialFarmIds)

  const createMutation = useMutation({
    mutationFn: (body: CreateFarmGroupRequest) => farmGroupApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmGroupKeys.all })
      navigate('/farm-groups')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (body: UpdateFarmGroupRequest) => farmGroupApi.update(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmGroupKeys.all })
      navigate('/farm-groups')
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedFarmIds.length === 0) return

    if (isEdit && groupId != null) {
      updateMutation.mutate({
        id: groupId,
        name: name.trim(),
        farmIds: selectedFarmIds,
      })
    } else if (clientId) {
      createMutation.mutate({
        clientId,
        name: name.trim(),
        farmIds: selectedFarmIds,
      })
    }
  }

  const toggleFarm = (farmId: number) => {
    setSelectedFarmIds((prev) =>
      prev.includes(farmId)
        ? prev.filter((x) => x !== farmId)
        : [...prev, farmId],
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <button
          type='button'
          onClick={() => navigate('/farm-groups')}
          className='p-2 hover:bg-gray-100 rounded-lg'
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className='text-3xl text-gray-800'>
          {isEdit ? L.formTitleEdit : L.formTitle}
        </h1>
      </div>

      <div className='bg-white rounded-xl shadow-md p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm text-gray-700 mb-2'>
              {L.groupName}
            </label>
            <input
              type='text'
              placeholder={L.placeholderName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
              required
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-2'>
              {L.selectFarms}
            </label>
            {farms.length === 0 ? (
              <p className='text-gray-400 text-sm'>{L.noFarmsAvailable}</p>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                {farms.map((farm) => {
                  const selected = selectedFarmIds.includes(farm.id)
                  return (
                    <button
                      key={farm.id}
                      type='button'
                      onClick={() => toggleFarm(farm.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        selected
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {farm.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={
                isPending || !name.trim() || selectedFarmIds.length === 0
              }
              className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
            >
              <Save size={20} />
              <span>
                {isPending ? th.common.loading : isEdit ? L.update : L.create}
              </span>
            </button>
            <button
              type='button'
              onClick={() => navigate('/farm-groups')}
              className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all'
            >
              {L.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function FarmGroupFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined

  const {
    data: existing,
    isPending: isGroupPending,
    isError: isGroupError,
  } = useFarmGroupQuery(Number(id), isEdit && !!id)

  const { data: farmListData } = useFarmListQuery(clientId)
  const farms = farmListData?.farms ?? []

  if (isEdit && isGroupPending) {
    return (
      <div className='space-y-6'>
        <p className='text-gray-600'>{th.common.loading}</p>
      </div>
    )
  }

  if (isEdit && (isGroupError || !existing)) {
    return (
      <div className='space-y-6'>
        <button
          type='button'
          onClick={() => navigate('/farm-groups')}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft size={20} />
          {L.cancel}
        </button>
        <p className='text-gray-600'>ไม่พบกลุ่มฟาร์ม</p>
      </div>
    )
  }

  const initialName = isEdit && existing ? existing.name : ''
  const initialFarmIds =
    isEdit && existing ? existing.farms.map((f) => f.id) : []
  const formKey = isEdit && existing ? String(existing.id) : 'new'
  const groupId = isEdit && existing ? existing.id : undefined

  return (
    <FarmGroupFormFields
      key={formKey}
      initialName={initialName}
      initialFarmIds={initialFarmIds}
      farms={farms}
      clientId={clientId}
      isEdit={isEdit}
      groupId={groupId}
    />
  )
}
