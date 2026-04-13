import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { th } from '../../locales/th'
import { useClient } from '../../contexts/ClientContext'
import { useWorkerQuery } from '../../hooks/useWorker'
import { useFarmGroupDropdownQuery } from '../../hooks/useFarmGroup'
import { WorkerFormFields } from './components/WorkerFormFields'
import { normalizeNationality } from './utils'

const L = th.workers

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
