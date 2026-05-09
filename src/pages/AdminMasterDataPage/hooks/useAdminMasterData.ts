import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  clientApi,
  type ClientResponse,
  type DropdownItem,
} from '../../../api/client'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import {
  clientKeys,
  useClientListQuery,
  useClientSummariesQuery,
  useInvalidateClientList,
} from '../../../hooks/useClient'
import type { ClientSummary } from '../../../api/client'
import { farmApi, type FarmResponse } from '../../../api/farm'
import { pondApi, type PondResponse } from '../../../api/pond'
import { farmKeys, useFarmListQuery } from '../../../hooks/useFarm'
import { pondKeys } from '../../../hooks/usePond'
import { useAppToast } from '../../../contexts/AppToastContext'
import {
  formatFarmDisplayNameTH,
  normalizeFarmNameForStore,
} from '../../../utils/masterDataName'
import { filterDigitsOnly, isDigitsOnly } from '../../../utils/phoneInput'
import { isValidEmail } from '../../../utils/emailInput'
import { th } from '../../../locales/th'
import { useAuthQuery } from '../../../hooks/useAuth'
import { UserLevel } from '../../../constants/userLevel'
import type { EditingItem } from '../types'

const t = th.adminMasterData

export function useAdminMasterData() {
  const { data: user } = useAuthQuery()
  const isSuperAdmin = user?.userLevel === UserLevel.SuperAdmin
  const isClientAdmin = user?.userLevel === UserLevel.ClientAdmin
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isClientAdmin && user?.clientId ? String(user.clientId) : '',
  )
  const { data: clientList = [], isLoading: clientListLoading } =
    useClientListQuery()
  const invalidateClientList = useInvalidateClientList()
  const [activeTab, setActiveTab] = useState<
    'clients' | 'farms' | 'ponds' | 'users'
  >(isSuperAdmin ? 'clients' : 'farms')
  const {
    data: clientSummaries = [],
    isLoading: clientSummariesLoading,
  } = useClientSummariesQuery(isSuperAdmin && activeTab === 'clients')
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedFarms, setExpandedFarms] = useState<string[]>([])
  const autoExpandedClientRef = useRef<string | null>(null)
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
  const [isSavingClientForm, setIsSavingClientForm] = useState(false)
  const [isSavingFarmForm, setIsSavingFarmForm] = useState(false)
  const [isSavingPondForm, setIsSavingPondForm] = useState(false)
  const [isEditSaving, setIsEditSaving] = useState(false)
  const farmList = farmListData?.farms ?? []

  useEffect(() => {
    if (farmList.length > 0 && selectedClientId && autoExpandedClientRef.current !== selectedClientId) {
      setExpandedFarms(farmList.map((f) => String(f.id)))
      autoExpandedClientRef.current = selectedClientId
    }
  }, [farmList, selectedClientId])

  useEffect(() => {
    if (!isClientAdmin || !user?.clientId) return
    if (!selectedClientId) {
      setSelectedClientId(String(user.clientId))
    }
    if (activeTab === 'clients' || activeTab === 'users') {
      setActiveTab('farms')
    }
  }, [activeTab, isClientAdmin, selectedClientId, user?.clientId])

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
    if (!isDigitsOnly(contactNumber)) {
      showToast('error', t.phoneDigitsOnly)
      return
    }
    const email = clientForm.email.trim()
    if (email && !isValidEmail(email)) {
      showToast('error', t.userErrorInvalidEmail)
      return
    }
    setIsSavingClientForm(true)
    try {
      const newClient = await clientApi.createClient({
        name,
        ownerName,
        contactNumber,
        email: email ? email : null,
      })
      queryClient.setQueriesData<DropdownItem[]>(
        { queryKey: clientKeys.list() },
        (old) =>
          old ? [...old, { key: newClient.id, value: newClient.name }] : old,
      )
      queryClient.setQueriesData<ClientSummary[]>(
        { queryKey: clientKeys.summaries() },
        (old) =>
          old
            ? [
                ...old,
                {
                  id: newClient.id,
                  name: newClient.name,
                  ownerName: newClient.ownerName,
                  contactNumber: newClient.contactNumber,
                  isActive: newClient.isActive,
                  farmCount: 0,
                  pondCount: 0,
                  userCount: 0,
                },
              ]
            : old,
      )
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
    } finally {
      setIsSavingClientForm(false)
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
    setIsSavingFarmForm(true)
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
    } finally {
      setIsSavingFarmForm(false)
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
    setIsSavingPondForm(true)
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
    } finally {
      setIsSavingPondForm(false)
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
      setEditingClientSnapshot({
        ...full,
        contactNumber: filterDigitsOnly(full.contactNumber ?? ''),
      })
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
    setIsEditSaving(true)
    try {
      if (editingItem.type === 'client') {
        const snap = editingClientSnapshot
        if (!snap) {
          showToast('error', t.alertLoadClientFailed)
          return
        }
        const contactNum = snap.contactNumber.trim()
        if (!isDigitsOnly(contactNum)) {
          showToast('error', t.phoneDigitsOnly)
          return
        }
        const emailTrimmed = snap.email?.trim() ?? ''
        if (emailTrimmed && !isValidEmail(emailTrimmed)) {
          showToast('error', t.userErrorInvalidEmail)
          return
        }
        await clientApi.updateClient({
          id: snap.id,
          name: raw,
          ownerName: snap.ownerName.trim(),
          contactNumber: contactNum,
          email: emailTrimmed ? emailTrimmed : null,
          isActive: snap.isActive,
          isTouristFishingEnabled: snap.isTouristFishingEnabled,
        })
        queryClient.setQueriesData<DropdownItem[]>(
          { queryKey: clientKeys.list() },
          (old) =>
            old?.map((c) => (c.key === snap.id ? { ...c, value: raw } : c)),
        )
        queryClient.setQueriesData<ClientSummary[]>(
          { queryKey: clientKeys.summaries() },
          (old) =>
            old?.map((c) => (c.id === snap.id ? { ...c, name: raw } : c)),
        )
        invalidateClientList()
      } else if (editingItem.type === 'farm') {
        const name = normalizeFarmNameForStore(raw)
        const farmId = Number(editingItem.id)
        await farmApi.updateFarm(farmId, { name })
        queryClient.setQueriesData<FarmResponse[]>(
          { queryKey: farmKeys.list() },
          (old) =>
            old?.map((f) => (f.id === farmId ? { ...f, name } : f)),
        )
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
    } finally {
      setIsEditSaving(false)
    }
  }

  const isClientFormValid =
    clientForm.name.trim() !== '' &&
    clientForm.contactPerson.trim() !== '' &&
    isDigitsOnly(clientForm.phone) &&
    (!clientForm.email.trim() || isValidEmail(clientForm.email))

  const onClientSelectChange = (value: string) => {
    setSelectedClientId(value)
    setSelectedFarmId('')
    setExpandedFarms([])
  }

  return {
    t,
    isSuperAdmin,
    selectedClientId,
    setSelectedClientId: onClientSelectChange,
    clientList,
    clientListLoading,
    clientSummaries,
    clientSummariesLoading,
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
    isSavingClientForm,
    isSavingFarmForm,
    isSavingPondForm,
    isEditSaving,
  }
}
