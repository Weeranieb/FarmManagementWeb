import { useState, useCallback, useMemo } from 'react'
import {
  clientApi,
  type ClientResponse,
  type DropdownItem,
} from '../../../api/client'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import {
  useClientListQuery,
  useInvalidateClientList,
} from '../../../hooks/useClient'
import { farmApi, type FarmResponse } from '../../../api/farm'
import { pondApi, type PondResponse } from '../../../api/pond'
import { farmKeys, useFarmListQuery } from '../../../hooks/useFarm'
import { pondKeys } from '../../../hooks/usePond'
import { useAppToast } from '../../../contexts/AppToastContext'
import {
  formatFarmDisplayNameTH,
  normalizeFarmNameForStore,
} from '../../../utils/masterDataName'
import { th } from '../../../locales/th'
import type { EditingItem } from '../types'

const t = th.adminMasterData

export function useAdminMasterData() {
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
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)

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

  const onClientSelectChange = (value: string) => {
    setSelectedClientId(value)
    setSelectedFarmId('')
    setExpandedFarms([])
  }

  return {
    t,
    selectedClientId,
    setSelectedClientId: onClientSelectChange,
    clientList,
    clientListLoading,
    selectedClient,
    selectedClientIdNum,
    farmListLoading,
    activeTab,
    setActiveTab,
    showSuccessMessage,
    successMessage,
    expandedFarms,
    isEditModalOpen,
    setIsEditModalOpen,
    editingClientSnapshot,
    setEditingClientSnapshot,
    editingItem,
    setEditingItem,
    clientForm,
    setClientForm,
    farmForm,
    setFarmForm,
    pondForms,
    setPondForms,
    selectedFarmId,
    setSelectedFarmId,
    farmList,
    clientFarms,
    totalPondCount,
    pondQueryByFarmId,
    handleClientSubmit,
    handleFarmSubmit,
    handlePondSubmit,
    addPondForm,
    removePondForm,
    updatePondForm,
    handleFarmNameChange,
    toggleFarmExpansion,
    handleEditClient,
    handleEditFarm,
    handleEditPond,
    handleSaveEdit,
    isClientFormValid,
  }
}
