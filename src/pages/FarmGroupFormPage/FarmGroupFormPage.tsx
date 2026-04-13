import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { th } from '../../locales/th'
import { useClient } from '../../contexts/ClientContext'
import { useFarmGroupQuery } from '../../hooks/useFarmGroup'
import { useFarmListQuery } from '../../hooks/useFarm'
import { FarmGroupFormFields } from './components/FarmGroupFormFields'

const L = th.farmGroups

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
