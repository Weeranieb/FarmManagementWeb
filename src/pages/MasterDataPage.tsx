import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { clientApi, type DropdownItem } from '../api/client'
import {
  farmApi,
  type FarmHierarchyItem,
  type FarmDetailPondItem,
} from '../api/farm'
import { pondApi } from '../api/pond'
import { EditMasterDataModal } from '../components/EditMasterDataModal'
import { th } from '../locales/th'

const L = th.masterData
type PondWithFarmId = FarmDetailPondItem & { farmId: number }

export function MasterDataPage() {
  // ——— useState ———
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clientList, setClientList] = useState<DropdownItem[]>([])
  const [clientListLoading, setClientListLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'farms' | 'ponds'>('farms')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedFarms, setExpandedFarms] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    id: string
    name: string
    type: 'farm' | 'pond'
  } | null>(null)
  const [farmForm, setFarmForm] = useState({ name: '' })
  const [pondForms, setPondForms] = useState([{ name: '' }])
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [farmHierarchy, setFarmHierarchy] = useState<FarmHierarchyItem[]>([])
  const [farmHierarchyLoading, setFarmHierarchyLoading] = useState(false)

  // ——— useEffect ———
  useEffect(() => {
    clientApi
      .getClientList()
      .then(setClientList)
      .catch(() => setClientList([]))
      .finally(() => setClientListLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setFarmHierarchyLoading(true)
    })
    farmApi
      .getFarmHierarchy(Number(selectedClientId))
      .then((data) => {
        if (!cancelled) setFarmHierarchy(data)
      })
      .catch(() => {
        if (!cancelled) setFarmHierarchy([])
      })
      .finally(() => {
        if (!cancelled) setFarmHierarchyLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedClientId])

  // ——— derived / select ———
  const selectedClient = clientList.find(
    (c) => String(c.key) === selectedClientId,
  )
  const clientFarms: FarmHierarchyItem[] = selectedClientId ? farmHierarchy : []
  const clientPonds: PondWithFarmId[] = selectedClientId
    ? farmHierarchy.flatMap((f) => f.ponds.map((p) => ({ ...p, farmId: f.id })))
    : []

  // Adapt hierarchy data to dropdown options for "Select Farm" (Create pond form).
  const farmDropdownOptions: DropdownItem[] = useMemo(
    () =>
      (selectedClientId ? farmHierarchy : []).map((f) => ({
        key: f.id,
        value: f.name,
      })),
    [selectedClientId, farmHierarchy],
  )

  const refetchHierarchy = useCallback((): Promise<void> => {
    if (!selectedClientId) return Promise.resolve()
    setFarmHierarchyLoading(true)
    return farmApi
      .getFarmHierarchy(Number(selectedClientId))
      .then(setFarmHierarchy)
      .catch(() => {
        // Don't clear list on refetch error so existing data stays visible
      })
      .finally(() => setFarmHierarchyLoading(false)) as Promise<void>
  }, [selectedClientId])

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmForm.name) {
      alert(L.alertFillRequired)
      return
    }
    if (!selectedClientId) return
    const name = farmForm.name.trim()
    try {
      await farmApi.createFarm({ clientId: Number(selectedClientId), name })
      setSuccessMessage(L.successFarmCreated(name, selectedClient?.value ?? ''))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setFarmForm({ name: '' })
      refetchHierarchy()
    } catch (err) {
      alert(err instanceof Error ? err.message : L.alertCreateFarmFailed)
    }
  }

  const handlePondSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmId) {
      alert(L.alertSelectFarm)
      return
    }
    const names = pondForms.map((f) => f.name.trim()).filter(Boolean)
    if (names.length === 0) {
      alert(L.alertAtLeastOnePondName)
      return
    }
    const selectedFarm = clientFarms.find(
      (f) => String(f.id) === selectedFarmId,
    )
    try {
      await pondApi.createPonds({ farmId: Number(selectedFarmId), names })
      const pondCount = names.length
      setSuccessMessage(L.successPondsCreated(pondCount, selectedFarm?.name ?? ''))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setPondForms([{ name: '' }])
      setSelectedFarmId('')
      refetchHierarchy()
    } catch (err) {
      alert(err instanceof Error ? err.message : L.alertCreatePondsFailed)
    }
  }

  const addPondForm = () => {
    setPondForms([...pondForms, { name: '' }])
  }

  const removePondForm = (index: number) => {
    if (pondForms.length > 1) {
      setPondForms(pondForms.filter((_, i) => i !== index))
    }
  }

  const updatePondForm = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const newForms = [...pondForms]
    if (field === 'name') {
      newForms[index] = { ...newForms[index], name: value as string }
    }
    setPondForms(newForms)
  }

  const handleFarmNameChange = (value: string) => {
    setFarmForm((prev) => ({ ...prev, name: value }))
  }

  const toggleFarmExpansion = (farmId: string) => {
    setExpandedFarms((prev) =>
      prev.includes(farmId)
        ? prev.filter((id) => id !== farmId)
        : [...prev, farmId],
    )
  }

  const handleEditFarm = (farm: FarmHierarchyItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingItem({ id: String(farm.id), name: farm.name, type: 'farm' })
    setIsEditModalOpen(true)
  }

  const handleEditPond = (pond: PondWithFarmId, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingItem({ id: String(pond.id), name: pond.name, type: 'pond' })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (newName: string) => {
    if (!editingItem) return
    const name = newName.trim()
    if (!name) return
    try {
      if (editingItem.type === 'farm') {
        await farmApi.updateFarm(Number(editingItem.id), { name })
      } else {
        await pondApi.updatePond(Number(editingItem.id), { name })
      }
      await refetchHierarchy()
      setSuccessMessage(
        L.successUpdated(editingItem.type === 'farm' ? 'ฟาร์ม' : 'บ่อ', name),
      )
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setIsEditModalOpen(false)
      setEditingItem(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : L.alertUpdateFailed)
    }
  }

  return (
    <div className='h-[calc(100vh-120px)] flex flex-col space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg flex items-center justify-center'>
            <Database size={20} className='text-white' />
          </div>
          <div>
            <h1 className='text-2xl text-gray-800'>{L.pageTitle}</h1>
            <p className='text-sm text-gray-600'>{L.pageSubtitle}</p>
          </div>
        </div>
      </div>

      {showSuccessMessage && (
        <div className='bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-md animate-fade-in'>
          <div className='flex items-center gap-2'>
            <CheckCircle size={20} className='text-green-600' />
            <p className='text-sm text-green-800'>{successMessage}</p>
          </div>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md p-3'>
        <div className='flex items-center gap-3'>
          <Users size={18} className='text-blue-600 flex-shrink-0' />
          <select
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value)
              setSelectedFarmId('')
              setExpandedFarms([])
            }}
            disabled={clientListLoading}
            className='flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
          >
            <option value=''>
              {clientListLoading ? L.loadingClients : L.selectClient}
            </option>
            {clientList.map((client) => (
              <option key={client.key} value={String(client.key)}>
                {client.value}
              </option>
            ))}
          </select>
          {selectedClient && (
            <div className='flex gap-2 text-xs'>
              <div className='bg-blue-100 px-2 py-1 rounded'>
                <span className='text-blue-800'>
                  {clientFarms.length} {L.farmsCount}
                </span>
              </div>
              <div className='bg-green-100 px-2 py-1 rounded'>
                <span className='text-green-800'>
                  {clientPonds.length} {L.pondsCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedClient ? (
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
                  onClick={() => setActiveTab('farms')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-sm ${
                    activeTab === 'farms'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building size={16} />
                  <span>{L.tabFarm}</span>
                </button>
                <button
                  onClick={() => setActiveTab('ponds')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-sm ${
                    activeTab === 'ponds'
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
              {activeTab === 'farms' && (
                <form onSubmit={handleFarmSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      {L.farmName} <span className='text-red-500'>{L.required}</span>
                    </label>
                    <input
                      type='text'
                      value={farmForm.name}
                      onChange={(e) => handleFarmNameChange(e.target.value)}
                      placeholder={L.placeholderFarmName}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                      required
                    />
                  </div>
                  <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                    <button
                      type='submit'
                      disabled={!farmForm.name.trim()}
                      className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                    >
                      <Plus size={16} />
                      <span>{L.createFarm}</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => setFarmForm({ name: '' })}
                      className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all'
                    >
                      {L.reset}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'ponds' && (
                <form onSubmit={handlePondSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      {L.selectFarm} <span className='text-red-500'>{L.required}</span>
                    </label>
                    <select
                      value={selectedFarmId}
                      onChange={(e) => setSelectedFarmId(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
                      required
                      disabled={farmHierarchyLoading}
                    >
                      <option value=''>
                        {farmHierarchyLoading
                          ? L.loading
                          : farmDropdownOptions.length === 0
                            ? L.noFarmsCreateFirst
                            : L.selectFarmOption}
                      </option>
                      {farmDropdownOptions.map((opt) => (
                        <option key={opt.key} value={String(opt.key)}>
                          {opt.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='space-y-3'>
                    {pondForms.map((pondForm, index) => (
                      <div
                        key={index}
                        className='p-3 border border-gray-200 rounded-lg space-y-3'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-800'>
                            {L.pond} {index + 1}
                          </span>
                          {pondForms.length > 1 && (
                            <button
                              type='button'
                              onClick={() => removePondForm(index)}
                              className='px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-all'
                            >
                              {L.remove}
                            </button>
                          )}
                        </div>
                        <div>
                          <label className='block text-xs text-gray-700 mb-1'>
                            {L.pondName} <span className='text-red-500'>{L.required}</span>
                          </label>
                          <input
                            type='text'
                            value={pondForm.name}
                            onChange={(e) =>
                              updatePondForm(index, 'name', e.target.value)
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
                    onClick={addPondForm}
                    className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all'
                  >
                    <Plus size={16} />
                    <span>{L.addAnotherPond}</span>
                  </button>
                  <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                    <button
                      type='submit'
                      disabled={
                        !selectedFarmId || pondForms.some((f) => !f.name.trim())
                      }
                      className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                    >
                      <Plus size={16} />
                      <span>
                        {L.createPonds} {pondForms.length} {L.pond}
                      </span>
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setPondForms([{ name: '' }])
                        setSelectedFarmId('')
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
                  {selectedClient.value}
                </span>
              </div>
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-3'>
              {farmHierarchyLoading ? (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  {L.loading}
                </div>
              ) : clientFarms.length === 0 ? (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  {L.noFarmsYet}
                </div>
              ) : (
                clientFarms.map((farm) => {
                  const farmPonds = clientPonds.filter(
                    (p) => p.farmId === farm.id,
                  )
                  const isExpanded = expandedFarms.includes(String(farm.id))
                  return (
                    <div
                      key={farm.id}
                      className='border border-gray-200 rounded-lg overflow-hidden'
                    >
                      <div className='w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors'>
                        <button
                          onClick={() => toggleFarmExpansion(String(farm.id))}
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
                          onClick={(e) => handleEditFarm(farm, e)}
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
                                        onClick={(e) => handleEditPond(pond, e)}
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
            <p className='text-blue-800 text-sm'>
              {L.chooseClientDescription}
            </p>
          </div>
        </div>
      )}

      {isEditModalOpen && editingItem && (
        <EditMasterDataModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentName={editingItem.name}
          title={
            editingItem.type === 'farm' ? L.editFarmTitle : L.editPondTitle
          }
          type={editingItem.type}
          onSave={handleSaveEdit}
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
