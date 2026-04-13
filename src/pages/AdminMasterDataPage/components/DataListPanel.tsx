import { Edit2 } from 'lucide-react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { DropdownItem } from '../../../api/client'
import type { FarmResponse } from '../../../api/farm'
import type { PondResponse } from '../../../api/pond'
import {
  formatFarmDisplayNameTH,
  formatPondDisplayNameTH,
} from '../../../utils/masterDataName'
import { StatusBadge } from '../../../components/StatusBadge'
import type { AdminMasterDataLocale } from '../../../locales/th'

type T = AdminMasterDataLocale

type Props = {
  t: T
  activeTab: 'clients' | 'farms' | 'ponds'
  clientList: DropdownItem[]
  clientListLoading: boolean
  selectedClientId: string
  selectedClient: DropdownItem | undefined
  clientFarms: FarmResponse[]
  farmListLoading: boolean
  expandedFarms: string[]
  pondQueryByFarmId: Record<
    string,
    UseQueryResult<PondResponse[], Error> | undefined
  >
  onEditClient: (client: DropdownItem, e: React.MouseEvent) => void
  onEditFarm: (farm: FarmResponse, e: React.MouseEvent) => void
  onEditPond: (pond: PondResponse, e: React.MouseEvent) => void
  onToggleFarmExpansion: (farmId: string) => void
}

export function DataListPanel({
  t,
  activeTab,
  clientList,
  clientListLoading,
  selectedClientId,
  selectedClient,
  clientFarms,
  farmListLoading,
  expandedFarms,
  pondQueryByFarmId,
  onEditClient,
  onEditFarm,
  onEditPond,
  onToggleFarmExpansion,
}: Props) {
  return (
    <div className='col-span-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-800'>
            {activeTab === 'clients' ? t.allClients : t.existingData}
          </h2>
          {selectedClient && activeTab !== 'clients' && (
            <span className='text-xs text-gray-600'>
              {selectedClient.value}
            </span>
          )}
        </div>
      </div>
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {activeTab === 'clients' && (
          <>
            {clientListLoading ? (
              <div className='text-center py-8 text-gray-500 text-sm'>
                {t.loading}
              </div>
            ) : clientList.length === 0 ? (
              <div className='text-center py-8 text-gray-500 text-sm'>
                {t.noClientsFound}
              </div>
            ) : (
              clientList.map((client) => (
                <div
                  key={client.key}
                  className='border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <h4 className='text-sm text-gray-800'>{client.value}</h4>
                    <button
                      type='button'
                      onClick={(e) => onEditClient(client, e)}
                      className='shrink-0 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50'
                      title={t.editClientName}
                      aria-label={t.editClientName}
                    >
                      <Edit2 size={14} aria-hidden />
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab !== 'clients' && (
          <>
            {!selectedClientId ? (
              <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-600'>
                <p>{t.selectClientToViewData}</p>
              </div>
            ) : farmListLoading ? (
              <div className='text-center py-8 text-gray-500 text-sm'>
                {t.loading}
              </div>
            ) : clientFarms.length === 0 ? (
              <div className='text-center py-8 text-gray-500 text-sm'>
                {t.noFarmsFound}
              </div>
            ) : (
              clientFarms.map((farm) => {
                const pondQ = pondQueryByFarmId[String(farm.id)]
                const farmPonds = pondQ?.data ?? []
                const pondsLoading = pondQ?.isPending ?? false
                const isExpanded = expandedFarms.includes(String(farm.id))
                return (
                  <div
                    key={farm.id}
                    className='border border-gray-200 rounded-lg overflow-hidden'
                  >
                    <div className='w-full p-3 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors'>
                      <button
                        type='button'
                        onClick={() => onToggleFarmExpansion(String(farm.id))}
                        className='flex min-w-0 flex-1 items-center justify-between gap-2 text-left'
                        aria-expanded={isExpanded}
                      >
                        <h4 className='truncate text-sm text-gray-800'>
                          {formatFarmDisplayNameTH(farm.name)}
                        </h4>
                        <div className='flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2'>
                          <span className='whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-800'>
                            {t.pondCountLabel(
                              isExpanded
                                ? farmPonds.length
                                : (farm.pondCount ?? 0),
                            )}
                          </span>
                          <span className='whitespace-nowrap text-xs font-medium text-blue-600'>
                            {isExpanded
                              ? t.collapseFarmPonds
                              : t.expandFarmPonds}
                          </span>
                        </div>
                      </button>
                      <button
                        type='button'
                        onClick={(e) => onEditFarm(farm, e)}
                        className='shrink-0 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50'
                        title={t.editFarmName}
                        aria-label={t.editFarmName}
                      >
                        <Edit2 size={14} aria-hidden />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className='border-t border-gray-200 bg-gray-50 p-3'>
                        {pondsLoading ? (
                          <p className='text-center text-gray-500 text-xs py-2'>
                            {t.loadingPonds}
                          </p>
                        ) : farmPonds.length === 0 ? (
                          <p className='text-center text-gray-500 text-xs py-2'>
                            {t.noPondsYet}
                          </p>
                        ) : (
                          <div className='space-y-2'>
                            {farmPonds.map((pond) => (
                              <div
                                key={pond.id}
                                className='bg-white border border-gray-200 rounded p-2'
                              >
                                <div className='mb-1 flex items-center justify-between gap-2'>
                                  <span className='min-w-0 flex-1 text-xs text-gray-800'>
                                    {formatPondDisplayNameTH(pond.name)}
                                  </span>
                                  <div className='flex shrink-0 items-center gap-2'>
                                    <button
                                      type='button'
                                      onClick={(e) => onEditPond(pond, e)}
                                      className='rounded p-1 text-blue-600 transition-colors hover:bg-blue-50'
                                      title={t.editPondName}
                                      aria-label={t.editPondName}
                                    >
                                      <Edit2 size={12} aria-hidden />
                                    </button>
                                    <StatusBadge
                                      status={pond.status}
                                      className='py-0.5'
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}
