import { useState } from 'react'
import type { AdminMasterDataLocale } from '../../../locales/th'
import type { DropdownItem } from '../../../api/client'
import type { UserResponse } from '../../../api/user'
import { CreateUserTab } from './CreateUserTab'
import { UserListPanel } from './UserListPanel'
import { EditUserModal } from './EditUserModal'

type T = AdminMasterDataLocale

type Props = {
  t: T
  clientList: DropdownItem[]
  clientListLoading: boolean
}

export function UserManagementPanel({ t, clientList, clientListLoading }: Props) {
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null)

  return (
    <div className='flex-1 grid grid-cols-2 gap-4 overflow-hidden'>
      <div className='bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
        <div className='p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white'>
          <h2 className='text-lg font-semibold'>{t.createNew}</h2>
        </div>
        <div className='flex-1 overflow-y-auto p-4'>
          <CreateUserTab
            t={t}
            clientList={clientList}
            clientListLoading={clientListLoading}
          />
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
        <div className='p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white'>
          <h2 className='text-lg font-semibold'>{t.existingData}</h2>
        </div>
        <UserListPanel
          t={t}
          clientList={clientList}
          onEdit={setEditingUser}
        />
      </div>

      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          t={t}
          user={editingUser}
          clientList={clientList}
          isOpen={true}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  )
}
