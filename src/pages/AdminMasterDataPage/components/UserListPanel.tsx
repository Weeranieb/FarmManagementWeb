import { useEffect, useMemo, useState } from 'react'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
import { th, type AdminMasterDataLocale } from '../../../locales/th'
import { UserLevel } from '../../../constants/userLevel'
import {
  useDeleteUserMutation,
  useUserListQuery,
} from '../../../hooks/useUser'
import { useAppToast } from '../../../contexts/AppToastContext'
import type { DropdownItem } from '../../../api/client'
import type { UserResponse } from '../../../api/user'
import { UserDeleteConfirm } from './UserDeleteConfirm'

type T = AdminMasterDataLocale

type Props = {
  t: T
  clientList: DropdownItem[]
  onEdit: (user: UserResponse) => void
  onResetPassword: (user: UserResponse) => void
}

function levelLabel(t: T, level: number): string {
  if (level === UserLevel.SuperAdmin) return t.userLevelSuperAdmin
  if (level === UserLevel.ClientAdmin) return t.userLevelClientAdmin
  return t.userLevelNormal
}

function useDebounced<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

export function UserListPanel({ t, clientList, onEdit, onResetPassword }: Props) {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [clientFilter, setClientFilter] = useState<string>('')

  const debouncedSearch = useDebounced(search, 250)

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      userLevel: levelFilter ? Number(levelFilter) : undefined,
      clientId: clientFilter ? Number(clientFilter) : undefined,
    }),
    [debouncedSearch, levelFilter, clientFilter],
  )

  const { data: users = [], isLoading } = useUserListQuery(filters)
  const deleteMutation = useDeleteUserMutation()
  const { showToast } = useAppToast()
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null)

  const clientNameById = useMemo(() => {
    const m: Record<number, string> = {}
    clientList.forEach((c) => {
      m[c.key] = c.value
    })
    return m
  }, [clientList])

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    const user = userToDelete
    try {
      await deleteMutation.mutateAsync(user.id)
      showToast('success', t.userSuccessDeleted(user.username))
      setUserToDelete(null)
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : t.userErrorDeleteFailed,
      )
    }
  }

  return (
    <div className='flex flex-col min-h-0 h-full'>
      <div className='p-3 border-b border-gray-200 flex flex-col gap-2 sm:flex-row'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.userSearchPlaceholder}
          className='flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        >
          <option value=''>{t.userFilterAllLevels}</option>
          <option value={UserLevel.Normal}>{t.userLevelNormal}</option>
          <option value={UserLevel.ClientAdmin}>{t.userLevelClientAdmin}</option>
          <option value={UserLevel.SuperAdmin}>{t.userLevelSuperAdmin}</option>
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        >
          <option value=''>{t.userFilterAllClients}</option>
          {clientList.map((c) => (
            <option key={c.key} value={String(c.key)}>
              {c.value}
            </option>
          ))}
        </select>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='p-6 text-center text-sm text-gray-500'>
            {th.common.loading}
          </div>
        ) : users.length === 0 ? (
          <div className='p-6 text-center text-sm text-gray-500'>
            {t.noUsersFound}
          </div>
        ) : (
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50 text-xs text-gray-600 sticky top-0'>
              <tr>
                <th className='text-left px-3 py-2'>{t.userUsername}</th>
                <th className='text-left px-3 py-2'>{t.userEmail}</th>
                <th className='text-left px-3 py-2'>{t.userFirstName}</th>
                <th className='text-left px-3 py-2'>{t.userUserLevel}</th>
                <th className='text-left px-3 py-2'>{t.userClient}</th>
                <th className='text-right px-3 py-2'>{t.userActionEdit}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2'>{u.username}</td>
                  <td className='px-3 py-2 text-gray-600'>{u.email ?? '-'}</td>
                  <td className='px-3 py-2'>
                    {u.firstName}
                    {u.lastName ? ` ${u.lastName}` : ''}
                  </td>
                  <td className='px-3 py-2'>{levelLabel(t, u.userLevel)}</td>
                  <td className='px-3 py-2 text-gray-600'>
                    {u.clientId != null
                      ? (clientNameById[u.clientId] ?? `#${u.clientId}`)
                      : '-'}
                  </td>
                  <td className='px-3 py-2 text-right whitespace-nowrap'>
                    <div className='inline-flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => onResetPassword(u)}
                        disabled={u.userLevel === UserLevel.SuperAdmin}
                        title={t.userActionResetPassword}
                        aria-label={t.userActionResetPassword}
                        className='p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors'
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={() => onEdit(u)}
                        disabled={u.userLevel === UserLevel.SuperAdmin}
                        title={t.userActionEdit}
                        aria-label={t.userActionEdit}
                        className='p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors'
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={() => setUserToDelete(u)}
                        disabled={
                          u.userLevel === UserLevel.SuperAdmin ||
                          deleteMutation.isPending
                        }
                        title={t.userActionDelete}
                        aria-label={t.userActionDelete}
                        className='p-1.5 rounded text-red-600 hover:text-red-800 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {userToDelete && (
        <UserDeleteConfirm
          t={t}
          username={userToDelete.username}
          onCancel={() => setUserToDelete(null)}
          onConfirm={handleDeleteConfirm}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
