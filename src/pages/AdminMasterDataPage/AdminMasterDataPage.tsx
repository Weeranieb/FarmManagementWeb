import { useState } from 'react'
import { Upload } from 'lucide-react'
import { BulkImportFarmPondModal } from '../../components/BulkImportFarmPondModal'
import { EditMasterDataModal } from '../../components/EditMasterDataModal'
import { PageHeader } from '../../components/PageHeader'
import { th } from '../../locales/th'
import { useAdminMasterData } from './hooks/useAdminMasterData'
import { CreateClientTab } from './components/CreateClientTab'
import { CreateFarmTab } from './components/CreateFarmTab'
import { CreatePondTab } from './components/CreatePondTab'
import { DataListPanel } from './components/DataListPanel'
import { UserManagementPanel } from './components/UserManagementPanel'

export function AdminMasterDataPage() {
  const ctx = useAdminMasterData()
  const { t } = ctx
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)

  const canBulkImport = ctx.activeTab === 'farms' || ctx.activeTab === 'ponds'
  const pageSubtitle = ctx.isSuperAdmin
    ? t.pageSubtitleSuperAdmin
    : t.pageSubtitleClientAdmin

  return (
    <div className='flex min-h-0 flex-col space-y-3'>
      <PageHeader title={t.pageTitle} subtitle={pageSubtitle} />

      {ctx.isSuperAdmin &&
        ctx.activeTab !== 'clients' &&
        ctx.activeTab !== 'users' && (
          <div className='bg-white rounded-lg shadow-md p-3'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
              <span className='text-xs font-medium text-gray-600 shrink-0 sm:w-40'>
                {t.clientSelectorCaption}
              </span>
              <select
                value={ctx.selectedClientId}
                onChange={(e) => ctx.setSelectedClientId(e.target.value)}
                disabled={ctx.clientListLoading}
                className='flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
              >
                <option value=''>
                  {ctx.clientListLoading ? t.loadingClients : t.selectClient}
                </option>
                {ctx.clientList.map((client) => (
                  <option key={client.key} value={String(client.key)}>
                    {client.value}
                  </option>
                ))}
              </select>
              {ctx.selectedClient && (
                <div className='flex gap-2 text-xs'>
                  <div className='bg-blue-100 px-2 py-1 rounded'>
                    <span className='text-blue-800'>
                      {ctx.clientFarms.length} {t.farmsCount}
                    </span>
                  </div>
                  <div className='bg-green-100 px-2 py-1 rounded'>
                    <span className='text-green-800'>
                      {ctx.totalPondCount} {t.pondsCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      <div className='bg-white rounded-lg shadow-md flex'>
        {ctx.isSuperAdmin && (
          <button
            type='button'
            onClick={() => {
              ctx.setActiveTab('clients')
              ctx.setSelectedClientId('')
            }}
            className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
              ctx.activeTab === 'clients'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.tabClient}
          </button>
        )}
        <button
          type='button'
          onClick={() => ctx.setActiveTab('farms')}
          className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
            ctx.activeTab === 'farms'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t.tabFarm}
        </button>
        <button
          type='button'
          onClick={() => ctx.setActiveTab('ponds')}
          className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
            ctx.activeTab === 'ponds'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t.tabPond}
        </button>
        {ctx.isSuperAdmin && (
          <button
            type='button'
            onClick={() => ctx.setActiveTab('users')}
            className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
              ctx.activeTab === 'users'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.tabUser}
          </button>
        )}
      </div>

      {ctx.activeTab === 'users' ? (
        <UserManagementPanel
          t={t}
          clientList={ctx.clientList}
          clientListLoading={ctx.clientListLoading}
        />
      ) : (
        <div className='flex-1 grid grid-cols-2 gap-4 overflow-hidden'>
          <div className='bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
            <div className='p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white flex items-center justify-between gap-3'>
              <h2 className='text-lg font-semibold'>{t.createNew}</h2>
              {canBulkImport && (
                <button
                  type='button'
                  onClick={() => setIsBulkImportOpen(true)}
                  disabled={!ctx.selectedClientId}
                  title={
                    !ctx.selectedClientId
                      ? t.pleaseSelectClientFirst
                      : undefined
                  }
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <Upload size={14} />
                  {t.bulkImportButton}
                </button>
              )}
            </div>

            <div className='flex-1 overflow-y-auto p-4'>
              {ctx.activeTab === 'clients' && (
                <CreateClientTab
                  t={t}
                  clientForm={ctx.clientForm}
                  setClientForm={ctx.setClientForm}
                  onSubmit={ctx.handleClientSubmit}
                  isClientFormValid={ctx.isClientFormValid}
                  isSubmitting={ctx.isSavingClientForm}
                />
              )}
              {ctx.activeTab === 'farms' && (
                <CreateFarmTab
                  t={t}
                  selectedClientId={ctx.selectedClientId}
                  farmForm={ctx.farmForm}
                  onFarmNameChange={ctx.handleFarmNameChange}
                  onSubmit={ctx.handleFarmSubmit}
                  onReset={() => ctx.setFarmForm({ name: '' })}
                  isSubmitting={ctx.isSavingFarmForm}
                />
              )}
              {ctx.activeTab === 'ponds' && (
                <CreatePondTab
                  t={t}
                  selectedClientId={ctx.selectedClientId}
                  selectedFarmId={ctx.selectedFarmId}
                  setSelectedFarmId={ctx.setSelectedFarmId}
                  clientFarms={ctx.clientFarms}
                  farmListLoading={ctx.farmListLoading}
                  pondForms={ctx.pondForms}
                  addPondForm={ctx.addPondForm}
                  removePondForm={ctx.removePondForm}
                  updatePondForm={ctx.updatePondForm}
                  onSubmit={ctx.handlePondSubmit}
                  onResetPonds={() => {
                    ctx.setPondForms([{ name: '', area: '' }])
                    ctx.setSelectedFarmId('')
                  }}
                  isSubmitting={ctx.isSavingPondForm}
                />
              )}
            </div>
          </div>

          <DataListPanel
            t={t}
            activeTab={ctx.activeTab}
            clientList={ctx.clientList}
            clientListLoading={ctx.clientListLoading}
            clientSummaries={ctx.clientSummaries}
            clientSummariesLoading={ctx.clientSummariesLoading}
            selectedClientId={ctx.selectedClientId}
            selectedClient={ctx.selectedClient}
            clientFarms={ctx.clientFarms}
            farmListLoading={ctx.farmListLoading}
            expandedFarms={ctx.expandedFarms}
            pondQueryByFarmId={ctx.pondQueryByFarmId}
            onEditClient={ctx.handleEditClient}
            onEditFarm={ctx.handleEditFarm}
            onEditPond={ctx.handleEditPond}
            onToggleFarmExpansion={ctx.toggleFarmExpansion}
            areAllFarmsExpanded={ctx.areAllFarmsExpanded}
            onToggleAllFarms={ctx.toggleAllFarms}
          />
        </div>
      )}

      {isBulkImportOpen && (
        <BulkImportFarmPondModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          selectedClientId={ctx.selectedClientId}
          selectedClientName={ctx.selectedClient?.value ?? ''}
          onImported={ctx.refetchHierarchy}
        />
      )}

      {ctx.isEditModalOpen && ctx.editingItem && (
        <EditMasterDataModal
          key={`${ctx.editingItem.type}-${ctx.editingItem.id}`}
          isOpen={ctx.isEditModalOpen}
          isSaving={ctx.isEditSaving}
          onClose={() => {
            if (ctx.isEditSaving) return
            ctx.setIsEditModalOpen(false)
            ctx.setEditingItem(null)
            ctx.setEditingClientSnapshot(null)
            ctx.setEditingPondArea('')
          }}
          currentName={ctx.editingItem.name}
          title={
            ctx.editingItem.type === 'client'
              ? t.editClientTitle
              : ctx.editingItem.type === 'farm'
                ? t.editFarmTitle
                : t.editPondTitle
          }
          onSave={ctx.handleSaveEdit}
          pondEditExtras={
            ctx.editingItem.type === 'pond'
              ? {
                  area: ctx.editingPondArea,
                  onAreaChange: ctx.setEditingPondArea,
                  labelArea: th.ponds.areaRai,
                  placeholderArea: th.ponds.areaRaiPlaceholder,
                }
              : undefined
          }
          clientEditExtras={
            ctx.editingItem.type === 'client' && ctx.editingClientSnapshot
              ? {
                  ownerName: ctx.editingClientSnapshot.ownerName,
                  contactNumber: ctx.editingClientSnapshot.contactNumber,
                  email:
                    (ctx.editingClientSnapshot as { email?: string | null })
                      .email ?? '',
                  onOwnerNameChange: (value) =>
                    ctx.setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, ownerName: value } : null,
                    ),
                  onContactNumberChange: (value) =>
                    ctx.setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, contactNumber: value } : null,
                    ),
                  onEmailChange: (value) =>
                    ctx.setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, email: value } : null,
                    ),
                  isTouristFishingEnabled:
                    ctx.editingClientSnapshot.isTouristFishingEnabled,
                  onTouristFishingEnabledChange: (value) =>
                    ctx.setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, isTouristFishingEnabled: value } : null,
                    ),
                  touristFishingLabel: t.clientTouristFishingEnabled,
                  labelOwnerName: t.contactPerson,
                  labelContactNumber: t.phone,
                  labelEmail: t.email,
                  placeholderOwnerName: t.placeholderContactPerson,
                  placeholderContactNumber: t.placeholderPhone,
                  placeholderEmail: t.placeholderEmail,
                  errorOwnerRequired: t.modalErrorOwnerRequired,
                  errorContactRequired: t.modalErrorContactRequired,
                  errorContactDigitsOnly: t.phoneDigitsOnly,
                  errorEmailInvalid: t.userErrorInvalidEmail,
                }
              : undefined
          }
          locale={{
            labelName:
              ctx.editingItem.type === 'client'
                ? t.clientName
                : t.modalLabelName,
            placeholderName:
              ctx.editingItem.type === 'client'
                ? t.placeholderClientName
                : t.modalPlaceholderName,
            errorNameRequired:
              ctx.editingItem.type === 'client'
                ? t.modalErrorClientNameRequired
                : t.modalErrorNameRequired,
            save: t.modalSave,
            cancel: t.modalCancel,
            close: t.modalClose,
          }}
        />
      )}
    </div>
  )
}
