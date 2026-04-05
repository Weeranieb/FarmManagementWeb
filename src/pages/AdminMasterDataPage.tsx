import { useState, useCallback, useMemo } from 'react'
import { Edit2 } from 'lucide-react'
import {
  clientApi,
  type ClientResponse,
  type DropdownItem,
} from '../api/client'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useClientListQuery, useInvalidateClientList } from '../hooks/useClient'
import { farmApi, type FarmResponse } from '../api/farm'
import { pondApi, type PondResponse } from '../api/pond'
import { farmKeys, useFarmListQuery } from '../hooks/useFarm'
import { pondKeys } from '../hooks/usePond'
import { useAppToast } from '../contexts/AppToastContext'
import { EditMasterDataModal } from '../components/EditMasterDataModal'
import { StatusBadge } from '../components/StatusBadge'
import {
  formatFarmDisplayNameTH,
  formatPondDisplayNameTH,
} from '../utils/masterDataName'
import { normalizeFarmNameForStore } from '../utils/masterDataName'
import { adminMasterDataTh } from '../locales/adminMasterData.th'
import { PageHeader } from '../components/PageHeader'

const t = adminMasterDataTh

export function AdminMasterDataPage() {
  // ——— useState ———
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const { data: clientList = [], isLoading: clientListLoading } =
    useClientListQuery()
  const invalidateClientList = useInvalidateClientList()
  const { showToast } = useAppToast()
  const queryClient = useQueryClient()
  const selectedClientIdNum = selectedClientId
    ? Number(selectedClientId)
    : undefined
  const { data: farmListData, isLoading: farmListLoading } = useFarmListQuery(
    selectedClientIdNum && selectedClientIdNum > 0
      ? selectedClientIdNum
      : undefined,
  )
  const [activeTab, setActiveTab] = useState<'clients' | 'farms' | 'ponds'>(
    'clients',
  )
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedFarms, setExpandedFarms] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingClientSnapshot, setEditingClientSnapshot] =
    useState<ClientResponse | null>(null)
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
  const farmList = farmListData?.farms ?? []

  const pondQueries = useQueries({
    queries: expandedFarms.map((farmIdStr) => ({
      queryKey: pondKeys.list(Number(farmIdStr)),
      queryFn: () => pondApi.getPondList(Number(farmIdStr)),
      enabled: Boolean(selectedClientId) && activeTab !== 'clients',
      staleTime: 5 * 60 * 1000,
    })),
  })

  const pondQueryByFarmId = useMemo(() => {
    const m: Record<string, (typeof pondQueries)[number] | undefined> = {}
    expandedFarms.forEach((id, i) => {
      m[id] = pondQueries[i]
    })
    return m
  }, [expandedFarms, pondQueries])

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
    const id = selectedClientIdNum
    if (!id) return
    void queryClient.invalidateQueries({
      queryKey: [...farmKeys.list(), id],
    })
  }, [queryClient, selectedClientIdNum])

  const refetchPondsForFarm = useCallback(
    (farmId: number) => {
      void queryClient.invalidateQueries({
        queryKey: pondKeys.list(farmId),
      })
    },
    [queryClient],
  )

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
      showToast('error', t.alertFillRequired)
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
      showToast(
        'error',
        err instanceof Error ? err.message : t.alertCreateClientFailed,
      )
    }
  }

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmForm.name.trim()) {
      showToast('error', t.alertFillRequired)
      return
    }
    if (!selectedClientId) return
    const name = normalizeFarmNameForStore(farmForm.name.trim())
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
      showToast(
        'error',
        err instanceof Error ? err.message : t.alertCreateFarmFailed,
      )
    }
  }

  const handlePondSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmId) {
      showToast('error', t.alertSelectFarm)
      return
    }
    const names = pondForms.map((f) => f.name.trim()).filter(Boolean)
    if (names.length === 0) {
      showToast('error', t.alertAtLeastOnePondName)
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
      showToast(
        'error',
        err instanceof Error ? err.message : t.alertCreatePondsFailed,
      )
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

  const handleEditClient = async (
    client: DropdownItem,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()
    try {
      const full = await clientApi.getClient(Number(client.key))
      setEditingClientSnapshot(full)
      setEditingItem({
        id: String(client.key),
        name: full.name,
        type: 'client',
      })
      setIsEditModalOpen(true)
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : t.alertLoadClientFailed,
      )
    }
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
    const raw = newName.trim()
    if (!raw) return
    try {
      if (editingItem.type === 'client') {
        const snap = editingClientSnapshot
        if (!snap) {
          showToast('error', t.alertLoadClientFailed)
          return
        }
        await clientApi.updateClient({
          id: snap.id,
          name: raw,
          ownerName: snap.ownerName.trim(),
          contactNumber: snap.contactNumber.trim(),
          isActive: snap.isActive,
          isTouristFishingEnabled: snap.isTouristFishingEnabled,
        })
        invalidateClientList()
      } else if (editingItem.type === 'farm') {
        const name = normalizeFarmNameForStore(raw)
        await farmApi.updateFarm(Number(editingItem.id), { name })
        refetchHierarchy()
      } else {
        await pondApi.updatePond(Number(editingItem.id), { name: raw })
        refetchHierarchy()
      }
      const typeLabel =
        editingItem.type === 'client'
          ? 'ลูกค้า'
          : editingItem.type === 'farm'
            ? 'ฟาร์ม'
            : 'บ่อ'
      const displayName =
        editingItem.type === 'farm' ? normalizeFarmNameForStore(raw) : raw
      setSuccessMessage(t.successUpdated(typeLabel, displayName))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setIsEditModalOpen(false)
      setEditingItem(null)
      setEditingClientSnapshot(null)
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : t.alertUpdateFailed,
      )
    }
  }

  const isClientFormValid =
    clientForm.name.trim() !== '' &&
    clientForm.contactPerson.trim() !== '' &&
    clientForm.phone.trim() !== ''

  return (
    <div className='flex min-h-0 flex-col space-y-3'>
      <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} />

      {showSuccessMessage && (
        <div className='bg-green-50 border-l-4 border-green-500 p-3 rounded-lg shadow-md animate-fade-in'>
          <p className='text-sm text-green-800'>{successMessage}</p>
        </div>
      )}

      {activeTab !== 'clients' && (
        <div className='bg-white rounded-lg shadow-md p-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
            <span className='text-xs font-medium text-gray-600 shrink-0 sm:w-40'>
              {t.clientSelectorCaption}
            </span>
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
              <h2 className='text-lg font-semibold'>{t.createNew}</h2>
            </div>
            <div className='flex'>
              <button
                onClick={() => {
                  setActiveTab('clients')
                  setSelectedClientId('')
                }}
                className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
                  activeTab === 'clients'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.tabClient}
              </button>
              <button
                onClick={() => setActiveTab('farms')}
                className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
                  activeTab === 'farms'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.tabFarm}
              </button>
              <button
                onClick={() => setActiveTab('ponds')}
                className={`flex-1 flex items-center justify-center px-4 py-3 transition-colors text-sm ${
                  activeTab === 'ponds'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.tabPond}
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
                    className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                  >
                    {t.createClient}
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
                  <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-gray-600'>
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
                        className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                      >
                        {t.createFarm}
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
                  <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-gray-600'>
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
                          role='group'
                          aria-label={t.pondFormRowAriaLabel(index + 1)}
                          className='p-3 border border-gray-200 rounded-lg space-y-3'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-gray-800 tabular-nums'>
                              {index + 1}.
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
                      className='w-full flex items-center justify-center px-4 py-2 text-sm border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all'
                    >
                      {t.addAnotherPond}
                    </button>
                    <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                      <button
                        type='submit'
                        disabled={
                          !selectedFarmId ||
                          pondForms.some((f) => !f.name.trim())
                        }
                        className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
                      >
                        {t.createPonds} {pondForms.length} {t.pond}
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
                        <h4 className='text-sm text-gray-800'>
                          {client.value}
                        </h4>
                        <button
                          type='button'
                          onClick={(e) => handleEditClient(client, e)}
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
                            onClick={() => toggleFarmExpansion(String(farm.id))}
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
                            onClick={(e) => handleEditFarm(farm, e)}
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
                                          onClick={(e) =>
                                            handleEditPond(pond, e)
                                          }
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
      </div>

      {isEditModalOpen && editingItem && (
        <EditMasterDataModal
          key={`${editingItem.type}-${editingItem.id}`}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingItem(null)
            setEditingClientSnapshot(null)
          }}
          currentName={editingItem.name}
          title={
            editingItem.type === 'client'
              ? t.editClientTitle
              : editingItem.type === 'farm'
                ? t.editFarmTitle
                : t.editPondTitle
          }
          onSave={handleSaveEdit}
          clientEditExtras={
            editingItem.type === 'client' && editingClientSnapshot
              ? {
                  ownerName: editingClientSnapshot.ownerName,
                  contactNumber: editingClientSnapshot.contactNumber,
                  onOwnerNameChange: (value) =>
                    setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, ownerName: value } : null,
                    ),
                  onContactNumberChange: (value) =>
                    setEditingClientSnapshot((prev) =>
                      prev ? { ...prev, contactNumber: value } : null,
                    ),
                  isTouristFishingEnabled:
                    editingClientSnapshot.isTouristFishingEnabled,
                  onTouristFishingEnabledChange: (value) =>
                    setEditingClientSnapshot((prev) =>
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
              editingItem.type === 'client' ? t.clientName : t.modalLabelName,
            placeholderName:
              editingItem.type === 'client'
                ? t.placeholderClientName
                : t.modalPlaceholderName,
            errorNameRequired:
              editingItem.type === 'client'
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
