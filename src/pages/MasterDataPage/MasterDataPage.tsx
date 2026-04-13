import {
  Building,
  Fish,
  Plus,
  Database,
  CheckCircle,
  Users,
  ChevronRight,
  ChevronDown,
  Edit2,
} from 'lucide-react'
import { EditMasterDataModal } from '../../components/EditMasterDataModal'
import { PageHeader } from '../../components/PageHeader'
import { useMasterDataPage } from './hooks'

export function MasterDataPage() {
  const ctx = useMasterDataPage()
  const { L } = ctx

  return (
    <div className='flex min-h-0 flex-col space-y-3'>
      <PageHeader
        title={L.pageTitle}
        subtitle={L.pageSubtitle}
        icon={Database}
      />

      {ctx.showSuccessMessage && (
        <div className='bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-md animate-fade-in'>
          <div className='flex items-center gap-2'>
            <CheckCircle size={20} className='text-green-600' />
            <p className='text-sm text-green-800'>{ctx.successMessage}</p>
          </div>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md p-3'>
        <div className='flex items-center gap-3'>
          <Users size={18} className='text-blue-600 flex-shrink-0' />
          <select
            value={ctx.selectedClientId}
            onChange={(e) => ctx.setSelectedClientId(e.target.value)}
            disabled={ctx.clientListLoading}
            className='flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
          >
            <option value=''>
              {ctx.clientListLoading ? L.loadingClients : L.selectClient}
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
                  {ctx.clientFarms.length} {L.farmsCount}
                </span>
              </div>
              <div className='bg-green-100 px-2 py-1 rounded'>
                <span className='text-green-800'>
                  {ctx.clientPonds.length} {L.pondsCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {ctx.selectedClient ? (
        <div className='flex-1 grid grid-cols-2 gap-4 overflow-hidden'>
          <div className='bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
            <div className='border-b border-gray-200'>
              <div className='p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white'>
                <h2 className='text-lg flex items-center gap-2'>
                  <Plus size={20} />
                  {L.createNew}
                </h2>
              </div>
              <div className='flex'>
                <button
                  type='button'
                  onClick={() => ctx.setActiveTab('farms')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-sm ${
                    ctx.activeTab === 'farms'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building size={16} />
                  <span>{L.tabFarm}</span>
                </button>
                <button
                  type='button'
                  onClick={() => ctx.setActiveTab('ponds')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-sm ${
                    ctx.activeTab === 'ponds'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Fish size={16} />
                  <span>{L.tabPond}</span>
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4'>
              {ctx.activeTab === 'farms' && (
                <form onSubmit={ctx.handleFarmSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      {L.farmName}{' '}
                      <span className='text-red-500'>{L.required}</span>
                    </label>
                    <input
                      type='text'
                      value={ctx.farmForm.name}
                      onChange={(e) => ctx.handleFarmNameChange(e.target.value)}
                      placeholder={L.placeholderFarmName}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                      required
                    />
                  </div>
                  <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                    <button
                      type='submit'
                      disabled={!ctx.farmForm.name.trim()}
                      className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                    >
                      <Plus size={16} />
                      <span>{L.createFarm}</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => ctx.setFarmForm({ name: '' })}
                      className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all'
                    >
                      {L.reset}
                    </button>
                  </div>
                </form>
              )}

              {ctx.activeTab === 'ponds' && (
                <form onSubmit={ctx.handlePondSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      {L.selectFarm}{' '}
                      <span className='text-red-500'>{L.required}</span>
                    </label>
                    <select
                      value={ctx.selectedFarmId}
                      onChange={(e) => ctx.setSelectedFarmId(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
                      required
                      disabled={ctx.farmHierarchyLoading}
                    >
                      <option value=''>
                        {ctx.farmHierarchyLoading
                          ? L.loading
                          : ctx.farmDropdownOptions.length === 0
                            ? L.noFarmsCreateFirst
                            : L.selectFarmOption}
                      </option>
                      {ctx.farmDropdownOptions.map((opt) => (
                        <option key={opt.key} value={String(opt.key)}>
                          {opt.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='space-y-3'>
                    {ctx.pondForms.map((pondForm, index) => (
                      <div
                        key={index}
                        role='group'
                        aria-label={L.pondFormRowAriaLabel(index + 1)}
                        className='p-3 border border-gray-200 rounded-lg space-y-3'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium text-gray-800 tabular-nums'>
                            {index + 1}.
                          </span>
                          {ctx.pondForms.length > 1 && (
                            <button
                              type='button'
                              onClick={() => ctx.removePondForm(index)}
                              className='px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-all'
                            >
                              {L.remove}
                            </button>
                          )}
                        </div>
                        <div>
                          <label className='block text-xs text-gray-700 mb-1'>
                            {L.pondName}{' '}
                            <span className='text-red-500'>{L.required}</span>
                          </label>
                          <input
                            type='text'
                            value={pondForm.name}
                            onChange={(e) =>
                              ctx.updatePondForm(index, 'name', e.target.value)
                            }
                            placeholder={L.placeholderPondName}
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={ctx.addPondForm}
                    className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all'
                  >
                    <Plus size={16} />
                    <span>{L.addAnotherPond}</span>
                  </button>
                  <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                    <button
                      type='submit'
                      disabled={
                        !ctx.selectedFarmId ||
                        ctx.pondForms.some((f) => !f.name.trim())
                      }
                      className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                    >
                      <Plus size={16} />
                      <span>
                        {L.createPonds} {ctx.pondForms.length} {L.pond}
                      </span>
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        ctx.setPondForms([{ name: '' }])
                        ctx.setSelectedFarmId('')
                      }}
                      className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all'
                    >
                      {L.reset}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className='col-span-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
            <div className='p-4 border-b border-gray-200 bg-gray-50'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg text-gray-800 flex items-center gap-2'>
                  <Building size={20} className='text-blue-600' />
                  {L.existingData}
                </h2>
                <span className='text-xs text-gray-600'>
                  {ctx.selectedClient.value}
                </span>
              </div>
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-3'>
              {ctx.farmHierarchyLoading ? (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  {L.loading}
                </div>
              ) : ctx.clientFarms.length === 0 ? (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  {L.noFarmsYet}
                </div>
              ) : (
                ctx.clientFarms.map((farm) => {
                  const farmPonds = ctx.clientPonds.filter(
                    (p) => p.farmId === farm.id,
                  )
                  const isExpanded = ctx.expandedFarms.includes(String(farm.id))
                  return (
                    <div
                      key={farm.id}
                      className='border border-gray-200 rounded-lg overflow-hidden'
                    >
                      <div className='w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors'>
                        <button
                          type='button'
                          onClick={() =>
                            ctx.toggleFarmExpansion(String(farm.id))
                          }
                          className='flex-1 flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <Building size={16} className='text-blue-600' />
                            <div className='text-left'>
                              <h4 className='text-sm text-gray-800'>
                                {farm.name}
                              </h4>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full'>
                              <Fish size={14} className='text-blue-600' />
                              <span>{farmPonds.length}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </div>
                        </button>
                        <button
                          type='button'
                          onClick={(e) => ctx.handleEditFarm(farm, e)}
                          className='ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title={L.editFarmName}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                      {isExpanded && (
                        <div className='border-t border-gray-200 bg-gray-50 p-3'>
                          {farmPonds.length === 0 ? (
                            <p className='text-center text-gray-500 text-xs py-2'>
                              {L.noPondsYet}
                            </p>
                          ) : (
                            <div className='space-y-2'>
                              {farmPonds.map((pond) => (
                                <div
                                  key={pond.id}
                                  className='bg-white border border-gray-200 rounded p-2'
                                >
                                  <div className='flex items-center justify-between mb-1'>
                                    <div className='flex items-center gap-1 flex-1'>
                                      <Fish
                                        size={14}
                                        className='text-blue-600'
                                      />
                                      <span className='text-xs text-gray-800'>
                                        {pond.name}
                                      </span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                      <button
                                        type='button'
                                        onClick={(e) =>
                                          ctx.handleEditPond(pond, e)
                                        }
                                        className='p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                                        title={L.editPondName}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='text-xs text-gray-600 pl-5'>
                                    —
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
            </div>
          </div>
        </div>
      ) : (
        <div className='flex-1 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center'>
          <div className='text-center p-8'>
            <Users size={48} className='text-blue-600 mx-auto mb-4' />
            <h3 className='text-xl text-blue-900 mb-2'>
              {L.selectClientToStart}
            </h3>
            <p className='text-blue-800 text-sm'>{L.chooseClientDescription}</p>
          </div>
        </div>
      )}

      {ctx.isEditModalOpen && ctx.editingItem && (
        <EditMasterDataModal
          key={`${ctx.editingItem.type}-${ctx.editingItem.id}`}
          isOpen={ctx.isEditModalOpen}
          onClose={() => ctx.setIsEditModalOpen(false)}
          currentName={ctx.editingItem.name}
          title={
            ctx.editingItem.type === 'farm' ? L.editFarmTitle : L.editPondTitle
          }
          onSave={ctx.handleSaveEdit}
          locale={{
            labelName: L.modalLabelName,
            placeholderName: L.modalPlaceholderName,
            errorNameRequired: L.modalErrorNameRequired,
            save: L.modalSave,
            cancel: L.modalCancel,
            close: L.modalClose,
          }}
        />
      )}
    </div>
  )
}
