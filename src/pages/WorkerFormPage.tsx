import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { th } from '../locales/th'
import { useClient } from '../contexts/ClientContext'
import { useWorkerQuery, workerKeys } from '../hooks/useWorker'
import { useFarmGroupDropdownQuery } from '../hooks/useFarmGroup'
import {
  workerApi,
  type CreateWorkerRequest,
  type UpdateWorkerBody,
  type WorkerResponse,
} from '../api/worker'
import type { DropdownItem } from '../api/farmGroup'

const L = th.workers

function normalizeNationality(n: string): 'Thai' | 'Cambodian' {
  return n === 'Cambodian' ? 'Cambodian' : 'Thai'
}

type WorkerFormFieldsProps = {
  farmGroupOptions: DropdownItem[]
  isEdit: boolean
  editContext: Pick<WorkerResponse, 'id' | 'clientId' | 'isActive'> | null
  initialFirstName: string
  initialLastName: string
  initialContactNumber: string
  initialNationality: 'Thai' | 'Cambodian'
  initialSalary: number | string
  initialHireDate: string
  initialFarmGroupId: number | ''
}

function WorkerFormFields({
  farmGroupOptions,
  isEdit,
  editContext,
  initialFirstName,
  initialLastName,
  initialContactNumber,
  initialNationality,
  initialSalary,
  initialHireDate,
  initialFarmGroupId,
}: WorkerFormFieldsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [contactNumber, setContactNumber] = useState(initialContactNumber)
  const [nationality, setNationality] = useState(initialNationality)
  const [salary, setSalary] = useState<number | string>(initialSalary)
  const [hireDate, setHireDate] = useState(initialHireDate)
  const [farmGroupId, setFarmGroupId] = useState<number | ''>(
    initialFarmGroupId,
  )

  const createMutation = useMutation({
    mutationFn: (body: CreateWorkerRequest) => workerApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all })
      navigate('/workers')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (body: UpdateWorkerBody) => workerApi.update(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all })
      navigate('/workers')
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !farmGroupId) return

    const parsedSalary =
      typeof salary === 'string' ? parseFloat(salary) : salary

    if (isEdit && editContext) {
      updateMutation.mutate({
        id: editContext.id,
        clientId: editContext.clientId,
        farmGroupId: Number(farmGroupId),
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        contactNumber: contactNumber.trim() || null,
        nationality,
        salary: parsedSalary || 0,
        hireDate: hireDate ? new Date(hireDate).toISOString() : null,
        isActive: editContext.isActive,
      })
    } else {
      createMutation.mutate({
        farmGroupId: Number(farmGroupId),
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        contactNumber: contactNumber.trim() || null,
        nationality,
        salary: parsedSalary || 0,
        hireDate: hireDate ? new Date(hireDate).toISOString() : null,
      })
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <button
          type='button'
          onClick={() => navigate('/workers')}
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.firstName}
              </label>
              <input
                type='text'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.lastName}
              </label>
              <input
                type='text'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
              />
            </div>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.contactNumber}
              </label>
              <input
                type='text'
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
              />
            </div>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.nationality}
              </label>
              <select
                value={nationality}
                onChange={(e) =>
                  setNationality(e.target.value as 'Thai' | 'Cambodian')
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
              >
                <option value='Thai'>{L.nationalityThai}</option>
                <option value='Cambodian'>{L.nationalityCambodian}</option>
              </select>
            </div>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.salaryThb}
              </label>
              <input
                type='number'
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
                required
              />
            </div>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.hireDate}
              </label>
              <input
                type='date'
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.farmGroup}
              </label>
              <select
                value={farmGroupId}
                onChange={(e) =>
                  setFarmGroupId(e.target.value ? Number(e.target.value) : '')
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
                required
              >
                <option value=''>{L.selectFarmGroup}</option>
                {farmGroupOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={isPending || !firstName.trim() || !farmGroupId}
              className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
            >
              <Save size={20} />
              <span>
                {isPending ? th.common.loading : isEdit ? L.update : L.create}
              </span>
            </button>
            <button
              type='button'
              onClick={() => navigate('/workers')}
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

export function WorkerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined

  const {
    data: existing,
    isPending: isWorkerPending,
    isError: isWorkerError,
  } = useWorkerQuery(Number(id), isEdit && !!id)
  const { data: farmGroupOptions = [] } = useFarmGroupDropdownQuery(clientId)

  if (isEdit && isWorkerPending) {
    return (
      <div className='space-y-6'>
        <p className='text-gray-600'>{th.common.loading}</p>
      </div>
    )
  }

  if (isEdit && (isWorkerError || !existing)) {
    return (
      <div className='space-y-6'>
        <button
          type='button'
          onClick={() => navigate('/workers')}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft size={20} />
          {L.cancel}
        </button>
        <p className='text-gray-600'>ไม่พบพนักงาน</p>
      </div>
    )
  }

  const formKey = isEdit && existing ? String(existing.id) : 'new'

  const editContext =
    isEdit && existing
      ? {
          id: existing.id,
          clientId: existing.clientId,
          isActive: existing.isActive,
        }
      : null

  return (
    <WorkerFormFields
      key={formKey}
      farmGroupOptions={farmGroupOptions}
      isEdit={isEdit}
      editContext={editContext}
      initialFirstName={isEdit && existing ? existing.firstName : ''}
      initialLastName={isEdit && existing ? (existing.lastName ?? '') : ''}
      initialContactNumber={
        isEdit && existing ? (existing.contactNumber ?? '') : ''
      }
      initialNationality={
        isEdit && existing ? normalizeNationality(existing.nationality) : 'Thai'
      }
      initialSalary={isEdit && existing ? existing.salary : 0}
      initialHireDate={
        isEdit && existing && existing.hireDate
          ? existing.hireDate.substring(0, 10)
          : ''
      }
      initialFarmGroupId={isEdit && existing ? existing.farmGroupId : ''}
    />
  )
}
