import { EditMasterDataModal } from '../../components/EditMasterDataModal'
import { PageHeader } from '../../components/PageHeader'
import { useAdminMasterData } from './hooks'
import { CreateClientTab } from './components/CreateClientTab'
import { CreateFarmTab } from './components/CreateFarmTab'
import { CreatePondTab } from './components/CreatePondTab'
import { DataListPanel } from './components/DataListPanel'

export function AdminMasterDataPage() {
  const ctx = useAdminMasterData()
  const { t } = ctx

  return (
    <div className='flex min-h-0 flex-col space-y-3'>
      <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} />

      {ctx.showSuccessMessage && (
        <div className='bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-md animate-fade-in'>
          <p className='text-sm text-green-800'>{ctx.successMessage}</p>
        </div>
      )}

      {ctx.activeTab !== 'clients' && (
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

      <div className='flex-1 grid grid-cols-2 gap-4 overflow-hidden'>
        <div className='bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
          <div className='border-b border-gray-200'>
            <div className='p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white'>
              <h2 className='text-lg font-semibold'>{t.createNew}</h2>
            </div>
            <div className='flex'>
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
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-4'>
            {ctx.activeTab === 'clients' && (
              <CreateClientTab
                t={t}
                clientForm={ctx.clientForm}
                setClientForm={ctx.setClientForm}
                onSubmit={ctx.handleClientSubmit}
                isClientFormValid={ctx.isClientFormValid}
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
                  ctx.setPondForms([{ name: '' }])
                  ctx.setSelectedFarmId('')
                }}
              />
            )}
          </div>
        </div>

        <DataListPanel
          t={t}
          activeTab={ctx.activeTab}
          clientList={ctx.clientList}
          clientListLoading={ctx.clientListLoading}
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
        />
      </div>

      {ctx.isEditModalOpen && ctx.editingItem && (
        <EditMasterDataModal
          key={`${ctx.editingItem.type}-${ctx.editingItem.id}`}
          isOpen={ctx.isEditModalOpen}
          onClose={() => {
            ctx.setIsEditModalOpen(false)
            ctx.setEditingItem(null)
            ctx.setEditingClientSnapshot(null)
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
          clientEditExtras={
            ctx.editingItem.type === 'client' && ctx.editingClientSnapshot
              ? {
                  ownerName: ctx.editingClientSnapshot.ownerName,
                  contactNumber: ctx.editingClientSnapshot.contactNumber,
                  onOwnerNameChange: (value) =>
                    ctx.setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, ownerName: value } : null,
                    ),
                  onContactNumberChange: (value) =>
                    ctx.setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, contactNumber: value } : null,
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
                  placeholderOwnerName: t.placeholderContactPerson,
                  placeholderContactNumber: t.placeholderPhone,
                  errorOwnerRequired: t.modalErrorOwnerRequired,
                  errorContactRequired: t.modalErrorContactRequired,
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
