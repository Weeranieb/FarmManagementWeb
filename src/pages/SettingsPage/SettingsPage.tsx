import { useState } from 'react'
import { Globe, Info, LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useAuthQuery, useLogoutMutation } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/ThemeContext'
import { UserLevel } from '../../constants/userLevel'
import { th } from '../../locales/th'
import { ListRow } from './ListRow'
import { EditProfileModal } from './EditProfileModal'

const L = th.settings

function getInitials(firstName?: string, username?: string) {
  const first = firstName?.trim()?.[0]
  if (first) return first.toUpperCase()
  return username?.trim()?.[0]?.toUpperCase() ?? '?'
}

function getRoleLabel(userLevel?: number) {
  if (userLevel === UserLevel.SuperAdmin) return L.roleSuperAdmin
  if (userLevel === UserLevel.ClientAdmin) return L.roleClientAdmin
  return L.roleFarmOwner
}

export function SettingsPage() {
  const { data: user } = useAuthQuery()
  const logoutMutation = useLogoutMutation()
  const { mode, toggleMode } = useTheme()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName?.trim() || user?.username || ''

  const initials = getInitials(user?.firstName, user?.username)
  const roleLabel = getRoleLabel(user?.userLevel)
  const themeLabel = mode === 'dark' ? L.modeDark : L.modeLight
  const ThemeIcon = mode === 'dark' ? Moon : Sun

  return (
    <div className='mx-auto w-full max-w-3xl'>
      <PageHeader title={L.title} subtitle={L.subtitle} icon={Settings} />

      <div className='space-y-6'>
        {/* Profile card */}
        <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200'>
              <span className='text-lg font-semibold text-blue-700'>
                {initials}
              </span>
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='truncate text-base font-semibold text-slate-900'>
                  {displayName || '—'}
                </p>
                <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700'>
                  {roleLabel}
                </span>
              </div>
              {user?.username ? (
                <p className='mt-0.5 font-mono text-xs text-slate-500'>
                  @{user.username}
                </p>
              ) : null}
              {user?.contactNumber ? (
                <p className='mt-0.5 truncate text-xs text-slate-500'>
                  {user.contactNumber}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Settings section */}
        <section>
          <p className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500'>
            {L.sectionSettings}
          </p>
          <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <ListRow
              icon={User}
              label={L.rowAccount}
              sub={L.rowAccountSub}
              onClick={() => setIsEditOpen(true)}
            />
            <ListRow
              icon={Globe}
              label={L.rowLanguage}
              trailing={L.langThai}
              disabled
            />
            <ListRow
              icon={Info}
              label={L.rowAbout}
              trailing={L.appVersion(__APP_VERSION__)}
              disabled
              isLast
            />
          </div>
        </section>

        {/* Display mode section */}
        <section>
          <p className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500'>
            {L.sectionDisplay}
          </p>
          <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <ListRow
              icon={ThemeIcon}
              label={L.rowTheme}
              sub={L.themeNow(themeLabel)}
              onClick={toggleMode}
            />
            <ListRow
              icon={LogOut}
              label={logoutMutation.isPending ? th.common.loading : L.rowLogout}
              danger
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              isLast
            />
          </div>
        </section>
      </div>

      {user && isEditOpen ? (
        <EditProfileModal user={user} onClose={() => setIsEditOpen(false)} />
      ) : null}
    </div>
  )
}
