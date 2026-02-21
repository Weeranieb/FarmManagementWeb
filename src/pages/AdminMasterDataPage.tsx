import { useState, useEffect, useCallback } from 'react'
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
import { useClientListQuery, useInvalidateClientList } from '../hooks/useClient'
import { farmApi, type FarmResponse } from '../api/farm'
import { pondApi, type PondResponse } from '../api/pond'
import { EditMasterDataModal } from '../components/EditMasterDataModal'
import { StatusBadge } from '../components/StatusBadge'
import {
  formatFarmDisplayNameTH,
  formatPondDisplayNameTH,
} from '../constants/masterDataFormatters'
import { adminMasterDataTh } from '../locales/adminMasterData.th'

const t = adminMasterDataTh

export function AdminMasterDataPage() {
  // ——— useState ———
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const { data: clientList = [], isLoading: clientListLoading } =
    useClientListQuery()
  const invalidateClientList = useInvalidateClientList()
  const [activeTab, setActiveTab] = useState<'clients' | 'farms' | 'ponds'>(
    'clients',
  )
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedFarms, setExpandedFarms] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    id: string
    name: string
    type: 'client' | 'farm' | 'pond'
  } | null>(null)

  const [clientForm, setClientForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
  })
  const [farmForm, setFarmForm] = useState({ name: '' })
  const [pondForms, setPondForms] = useState([{ name: '' }])
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [farmList, setFarmList] = useState<FarmResponse[]>([])
  const [farmListLoading, setFarmListLoading] = useState(false)
  const [pondsByFarmId, setPondsByFarmId] = useState<
    Record<string, PondResponse[]>
  >({})
  const [pondsLoadingFarmIds, setPondsLoadingFarmIds] = useState<Set<string>>(
    new Set(),
  )

  // ——— fetch farm list when client is selected ———
  useEffect(() => {
    if (!selectedClientId) {
      queueMicrotask(() => {
        setFarmList([])
        setPondsByFarmId({})
      })
      return
    }
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setFarmListLoading(true)
    })
    farmApi
      .getFarmList(Number(selectedClientId))
      .then((res) => {
        if (!cancelled) setFarmList(res?.farms ?? [])
      })
      .catch(() => {
        if (!cancelled) setFarmList([])
      })
      .finally(() => {
        if (!cancelled) setFarmListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedClientId])

  // ——— fetch pond list when a farm is expanded ———
  useEffect(() => {
    if (activeTab === 'clients' || !selectedClientId) return
    expandedFarms.forEach((farmId) => {
      if (pondsByFarmId[farmId] !== undefined) return
      if (pondsLoadingFarmIds.has(farmId)) return
      setPondsLoadingFarmIds((prev) => new Set(prev).add(farmId))
      pondApi
        .getPondList(Number(farmId))
        .then((list) => {
          setPondsByFarmId((prev) => ({ ...prev, [farmId]: list ?? [] }))
        })
        .catch(() => {
          setPondsByFarmId((prev) => ({ ...prev, [farmId]: [] }))
        })
        .finally(() => {
          setPondsLoadingFarmIds((prev) => {
            const next = new Set(prev)
            next.delete(farmId)
            return next
          })
        })
    })
  }, [
    selectedClientId,
    activeTab,
    expandedFarms,
    pondsByFarmId,
    pondsLoadingFarmIds,
  ])

  // ——— derived ———
  const selectedClient = clientList.find(
    (c) => String(c.key) === selectedClientId,
  )
  const clientFarms: FarmResponse[] =
    selectedClientId && activeTab !== 'clients' ? farmList : []
  const totalPondCount = clientFarms.reduce(
    (sum, f) => sum + (f.pondCount ?? 0),
    0,
  )

  const refetchFarmList = useCallback(() => {
    if (!selectedClientId) return
    setFarmListLoading(true)
    farmApi
      .getFarmList(Number(selectedClientId))
      .then((res) => setFarmList(res?.farms ?? []))
      .catch(() => setFarmList([]))
      .finally(() => setFarmListLoading(false))
  }, [selectedClientId])

  const refetchPondsForFarm = useCallback((farmId: number) => {
    const id = String(farmId)
    setPondsLoadingFarmIds((prev) => new Set(prev).add(id))
    pondApi
      .getPondList(farmId)
      .then((list) => {
        setPondsByFarmId((prev) => ({ ...prev, [id]: list ?? [] }))
      })
      .catch(() => {
        setPondsByFarmId((prev) => ({ ...prev, [id]: [] }))
      })
      .finally(() => {
        setPondsLoadingFarmIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      })
  }, [])

  const refetchHierarchy = useCallback(() => {
    refetchFarmList()
    expandedFarms.forEach((farmId) => refetchPondsForFarm(Number(farmId)))
  }, [refetchFarmList, refetchPondsForFarm, expandedFarms])

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = clientForm.name.trim()
    const ownerName = clientForm.contactPerson.trim()
    const contactNumber = clientForm.phone.trim()
    if (!name || !ownerName || !contactNumber) {
      alert(t.alertFillRequired)
      return
    }
    try {
      await clientApi.createClient({ name, ownerName, contactNumber })
      setSuccessMessage(t.successClientCreated(name))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setClientForm({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
      })
      invalidateClientList()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.alertCreateClientFailed)
    }
  }

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmForm.name.trim()) {
      alert(t.alertFillRequired)
      return
    }
    if (!selectedClientId) return
    const name = farmForm.name.trim()
    try {
      await farmApi.createFarm({
        clientId: Number(selectedClientId),
        name,
      })
      setSuccessMessage(
        t.successFarmCreated(
          formatFarmDisplayNameTH(name),
          selectedClient?.value ?? '',
        ),
      )
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setFarmForm({ name: '' })
      refetchHierarchy()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.alertCreateFarmFailed)
    }
  }

  const handlePondSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmId) {
      alert(t.alertSelectFarm)
      return
    }
    const names = pondForms.map((f) => f.name.trim()).filter(Boolean)
    if (names.length === 0) {
      alert(t.alertAtLeastOnePondName)
      return
    }
    const selectedFarm = clientFarms.find(
      (f) => String(f.id) === selectedFarmId,
    )
    try {
      await pondApi.createPonds({ farmId: Number(selectedFarmId), names })
      const pondCount = names.length
      setSuccessMessage(
        t.successPondsCreated(
          pondCount,
          formatFarmDisplayNameTH(selectedFarm?.name ?? ''),
        ),
      )
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setPondForms([{ name: '' }])
      refetchFarmList()
      refetchPondsForFarm(Number(selectedFarmId))
    } catch (err) {
      alert(err instanceof Error ? err.message : t.alertCreatePondsFailed)
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

  const handleEditClient = (client: DropdownItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingItem({
      id: String(client.key),
      name: client.value,
      type: 'client',
    })
    setIsEditModalOpen(true)
  }

  const handleEditFarm = (farm: FarmResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingItem({
      id: String(farm.id),
      name: farm.name,
      type: 'farm',
    })
    setIsEditModalOpen(true)
  }

  const handleEditPond = (pond: PondResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingItem({
      id: String(pond.id),
      name: pond.name,
      type: 'pond',
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (newName: string) => {
    if (!editingItem) return
    const name = newName.trim()
    if (!name) return
    try {
      if (editingItem.type === 'client') {
        const client = await clientApi.getClient(Number(editingItem.id))
        await clientApi.updateClient({
          id: client.id,
          name,
          ownerName: client.ownerName,
          contactNumber: client.contactNumber,
          isActive: client.isActive,
        })
        invalidateClientList()
      } else if (editingItem.type === 'farm') {
        await farmApi.updateFarm(Number(editingItem.id), { name })
        refetchHierarchy()
      } else {
        await pondApi.updatePond(Number(editingItem.id), { name })
        refetchHierarchy()
      }
      const typeLabel =
        editingItem.type === 'client'
          ? 'ลูกค้า'
          : editingItem.type === 'farm'
            ? 'ฟาร์ม'
            : 'บ่อ'
      setSuccessMessage(t.successUpdated(typeLabel, name))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setIsEditModalOpen(false)
      setEditingItem(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : t.alertUpdateFailed)
    }
  }

  const isClientFormValid =
    clientForm.name.trim() !== '' &&
    clientForm.contactPerson.trim() !== '' &&
    clientForm.phone.trim() !== ''

  return (
    <div className='h-[calc(100vh-120px)] flex flex-col space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg flex items-center justify-center'>
            <Database size={20} className='text-white' />
          </div>
          <div>
            <h1 className='text-2xl text-gray-800'>{t.pageTitle}</h1>
            <p className='text-sm text-gray-600'>{t.pageSubtitle}</p>
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

      {activeTab !== 'clients' && (
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
                {clientListLoading ? t.loadingClients : t.selectClient}
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
                    {clientFarms.length} {t.farmsCount}
                  </span>
                </div>
                <div className='bg-green-100 px-2 py-1 rounded'>
                  <span className='text-green-800'>
                    {totalPondCount} {t.pondsCount}
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
              <h2 className='text-lg flex items-center gap-2'>
                <Plus size={20} />
                {t.createNew}
              </h2>
            </div>
            <div className='flex'>
              <button
                onClick={() => {
                  setActiveTab('clients')
                  setSelectedClientId('')
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-sm ${
                  activeTab === 'clients'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users size={16} />
                <span>{t.tabClient}</span>
              </button>
              <button
                onClick={() => setActiveTab('farms')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-sm ${
                  activeTab === 'farms'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building size={16} />
                <span>{t.tabFarm}</span>
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
                <span>{t.tabPond}</span>
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-4'>
            {activeTab === 'clients' && (
              <form onSubmit={handleClientSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    {t.clientName}{' '}
                    <span className='text-red-500'>{t.required}</span>
                  </label>
                  <input
                    type='text'
                    value={clientForm.name}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, name: e.target.value })
                    }
                    placeholder={t.placeholderClientName}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    {t.contactPerson}{' '}
                    <span className='text-red-500'>{t.required}</span>
                  </label>
                  <input
                    type='text'
                    value={clientForm.contactPerson}
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        contactPerson: e.target.value,
                      })
                    }
                    placeholder={t.placeholderContactPerson}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    {t.phone} <span className='text-red-500'>{t.required}</span>
                  </label>
                  <input
                    type='tel'
                    value={clientForm.phone}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, phone: e.target.value })
                    }
                    placeholder={t.placeholderPhone}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-700 mb-1'>
                    {t.email}
                  </label>
                  <input
                    type='email'
                    value={clientForm.email}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, email: e.target.value })
                    }
                    placeholder={t.placeholderEmail}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  />
                </div>
                <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                  <button
                    type='submit'
                    disabled={!isClientFormValid}
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                  >
                    <Plus size={16} />
                    <span>{t.createClient}</span>
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setClientForm({
                        name: '',
                        contactPerson: '',
                        phone: '',
                        email: '',
                      })
                    }
                    className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    {t.reset}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'farms' && (
              <>
                {!selectedClientId ? (
                  <div className='text-center py-12 text-gray-500'>
                    <Users size={48} className='mx-auto mb-3 text-gray-400' />
                    <p className='text-sm'>{t.pleaseSelectClientFirst}</p>
                  </div>
                ) : (
                  <form onSubmit={handleFarmSubmit} className='space-y-4'>
                    <div>
                      <label className='block text-sm text-gray-700 mb-1'>
                        {t.farmName}{' '}
                        <span className='text-red-500'>{t.required}</span>
                      </label>
                      <input
                        type='text'
                        value={farmForm.name}
                        onChange={(e) => handleFarmNameChange(e.target.value)}
                        placeholder={t.placeholderFarmName}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                      />
                    </div>
                    <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                      <button
                        type='submit'
                        disabled={!farmForm.name.trim()}
                        className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                      >
                        <Plus size={16} />
                        <span>{t.createFarm}</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => setFarmForm({ name: '' })}
                        className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        {t.reset}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeTab === 'ponds' && (
              <>
                {!selectedClientId ? (
                  <div className='text-center py-12 text-gray-500'>
                    <Users size={48} className='mx-auto mb-3 text-gray-400' />
                    <p className='text-sm'>{t.pleaseSelectClientFirst}</p>
                  </div>
                ) : (
                  <form onSubmit={handlePondSubmit} className='space-y-4'>
                    <div>
                      <label className='block text-sm text-gray-700 mb-1'>
                        {t.selectFarm}{' '}
                        <span className='text-red-500'>{t.required}</span>
                      </label>
                      <select
                        value={selectedFarmId}
                        onChange={(e) => setSelectedFarmId(e.target.value)}
                        disabled={farmListLoading}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
                        aria-label={t.selectFarm}
                      >
                        <option value=''>
                          {farmListLoading
                            ? t.loading
                            : clientFarms.length === 0
                              ? `-- ${t.noFarmsYet} --`
                              : t.selectFarmOption}
                        </option>
                        {clientFarms.map((farm) => (
                          <option key={farm.id} value={String(farm.id)}>
                            {formatFarmDisplayNameTH(farm.name)}
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
                              {t.pond} {index + 1}
                            </span>
                            {pondForms.length > 1 && (
                              <button
                                type='button'
                                onClick={() => removePondForm(index)}
                                className='px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-all'
                              >
                                {t.remove}
                              </button>
                            )}
                          </div>
                          <div>
                            <label className='block text-xs text-gray-700 mb-1'>
                              {t.pondName}{' '}
                              <span className='text-red-500'>{t.required}</span>
                            </label>
                            <input
                              type='text'
                              value={pondForm.name}
                              onChange={(e) =>
                                updatePondForm(index, 'name', e.target.value)
                              }
                              placeholder={t.placeholderPondName}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
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
                      <span>{t.addAnotherPond}</span>
                    </button>
                    <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                      <button
                        type='submit'
                        disabled={
                          !selectedFarmId ||
                          pondForms.some((f) => !f.name.trim())
                        }
                        className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                      >
                        <Plus size={16} />
                        <span>
                          {t.createPonds} {pondForms.length} {t.pond}
                        </span>
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setPondForms([{ name: '' }])
                          setSelectedFarmId('')
                        }}
                        className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        {t.reset}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <div className='col-span-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden'>
          <div className='p-4 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg text-gray-800 flex items-center gap-2'>
                {activeTab === 'clients' ? (
                  <Users size={20} className='text-blue-600' />
                ) : (
                  <Building size={20} className='text-blue-600' />
                )}
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
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-2'>
                          <Users size={16} className='text-blue-600' />
                          <h4 className='text-sm text-gray-800'>
                            {client.value}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => handleEditClient(client, e)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title={t.editClientName}
                        >
                          <Edit2 size={14} />
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
                  <div className='text-center py-12 text-gray-500 text-sm'>
                    <Users size={48} className='mx-auto mb-3 text-gray-400' />
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
                    const farmPonds = pondsByFarmId[String(farm.id)] ?? []
                    const pondsLoading = pondsLoadingFarmIds.has(
                      String(farm.id),
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
                                  {formatFarmDisplayNameTH(farm.name)}
                                </h4>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <StatusBadge status={farm.status} />
                              <div className='flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full'>
                                <Fish size={14} className='text-blue-600' />
                                <span>
                                  {isExpanded
                                    ? farmPonds.length
                                    : farm.pondCount}
                                </span>
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
                            title={t.editFarmName}
                          >
                            <Edit2 size={14} />
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
                                    <div className='flex items-center justify-between mb-1'>
                                      <div className='flex items-center gap-1 flex-1'>
                                        <Fish
                                          size={14}
                                          className='text-blue-600'
                                        />
                                        <span className='text-xs text-gray-800'>
                                          {formatPondDisplayNameTH(pond.name)}
                                        </span>
                                      </div>
                                      <div className='flex items-center gap-1'>
                                        <button
                                          onClick={(e) =>
                                            handleEditPond(pond, e)
                                          }
                                          className='p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                                          title={t.editPondName}
                                        >
                                          <Edit2 size={12} />
                                        </button>
                                        <StatusBadge
                                          status={pond.status}
                                          className='py-0.5'
                                        />
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
              </>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && editingItem && (
        <EditMasterDataModal
          key={`${editingItem.type}-${editingItem.id}`}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingItem(null)
          }}
          currentName={editingItem.name}
          title={
            editingItem.type === 'client'
              ? t.editClientTitle
              : editingItem.type === 'farm'
                ? t.editFarmTitle
                : t.editPondTitle
          }
          type={editingItem.type}
          onSave={handleSaveEdit}
          locale={{
            labelName: t.modalLabelName,
            placeholderName: t.modalPlaceholderName,
            errorNameRequired: t.modalErrorNameRequired,
            save: t.modalSave,
            cancel: t.modalCancel,
            close: t.modalClose,
          }}
        />
      )}
    </div>
  )
}
