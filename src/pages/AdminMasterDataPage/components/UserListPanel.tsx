import { useEffect, useMemo, useState } from 'react'
import { th, type AdminMasterDataLocale } from '../../../locales/th'
import { UserLevel } from '../../../constants/userLevel'
import {
  useDeleteUserMutation,
  useUserListQuery,
} from '../../../hooks/useUser'
import { useAppToast } from '../../../contexts/AppToastContext'
import type { DropdownItem } from '../../../api/client'
import type { UserResponse } from '../../../api/user'

type T = AdminMasterDataLocale

type Props = {
  t: T
  clientList: DropdownItem[]
  onEdit: (user: UserResponse) => void
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

export function UserListPanel({ t, clientList, onEdit }: Props) {
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

  const clientNameById = useMemo(() => {
    const m: Record<number, string> = {}
    clientList.forEach((c) => {
      m[c.key] = c.value
    })
    return m
  }, [clientList])

  const handleDelete = async (user: UserResponse) => {
    if (!window.confirm(t.userDeleteConfirm(user.username))) return
    try {
      await deleteMutation.mutateAsync(user.id)
      showToast('success', t.userSuccessDeleted(user.username))
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
                    <button
                      type='button'
                      onClick={() => onEdit(u)}
                      disabled={u.userLevel === UserLevel.SuperAdmin}
                      className='text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed mr-3'
                    >
                      {t.userActionEdit}
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(u)}
                      disabled={
                        u.userLevel === UserLevel.SuperAdmin ||
                        deleteMutation.isPending
                      }
                      className='text-xs text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed'
                    >
                      {t.userActionDelete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
