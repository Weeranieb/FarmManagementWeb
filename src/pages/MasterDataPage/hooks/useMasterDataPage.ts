import { useState, useCallback } from 'react'
import type { DropdownItem } from '../../../api/client'
import { farmApi, type FarmHierarchyItem } from '../../../api/farm'
import { pondApi } from '../../../api/pond'
import { normalizeFarmNameForStore } from '../../../utils/masterDataName'
import { th } from '../../../locales/th'
import { useClient } from '../../../contexts/ClientContext'
import { useClientListQuery } from '../../../hooks/useClient'
import { farmKeys, useFarmHierarchyQuery } from '../../../hooks/useFarm'
import { useQueryClient } from '@tanstack/react-query'
import { useAppToast } from '../../../contexts/AppToastContext'
import type { PondWithFarmId, MasterDataEditingItem } from '../types'

const L = th.masterData

export function useMasterDataPage() {
  const { selectedClientId, setSelectedClientId } = useClient()
  const { data: clientList = [], isLoading: clientListLoading } =
    useClientListQuery()
  const { showToast } = useAppToast()
  const queryClient = useQueryClient()
  const clientIdNum =
    selectedClientId && !Number.isNaN(Number(selectedClientId))
      ? Number(selectedClientId)
      : undefined
  const {
    data: farmHierarchy = [],
    isPending: hierarchyPending,
    isFetching: hierarchyFetching,
  } = useFarmHierarchyQuery(clientIdNum)

  const [activeTab, setActiveTab] = useState<'farms' | 'ponds'>('farms')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedFarms, setExpandedFarms] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterDataEditingItem | null>(
    null,
  )
  const [farmForm, setFarmForm] = useState({ name: '' })
  const [pondForms, setPondForms] = useState([{ name: '' }])
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [isSavingFarmForm, setIsSavingFarmForm] = useState(false)
  const [isSavingPondForm, setIsSavingPondForm] = useState(false)
  const [isEditSaving, setIsEditSaving] = useState(false)

  const farmHierarchyLoading = hierarchyPending || hierarchyFetching

  const selectedClient = clientList.find(
    (c) => String(c.key) === selectedClientId,
  )
  const clientFarms: FarmHierarchyItem[] = selectedClientId ? farmHierarchy : []
  const clientPonds: PondWithFarmId[] = selectedClientId
    ? farmHierarchy.flatMap((f) => f.ponds.map((p) => ({ ...p, farmId: f.id })))
    : []

  const farmDropdownOptions: DropdownItem[] = selectedClientId
    ? farmHierarchy.map((f) => ({ key: f.id, value: f.name }))
    : []

  const refetchHierarchy = useCallback((): Promise<void> => {
    const cid = clientIdNum
    if (!cid) return Promise.resolve()
    return queryClient.invalidateQueries({
      queryKey: [...farmKeys.all, 'hierarchy', cid],
    })
  }, [queryClient, clientIdNum])

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmForm.name) {
      showToast('error', L.alertFillRequired)
      return
    }
    if (!selectedClientId) return
    const name = normalizeFarmNameForStore(farmForm.name.trim())
    setIsSavingFarmForm(true)
    try {
      await farmApi.createFarm({ clientId: Number(selectedClientId), name })
      setSuccessMessage(L.successFarmCreated(name, selectedClient?.value ?? ''))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setFarmForm({ name: '' })
      refetchHierarchy()
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : L.alertCreateFarmFailed,
      )
    } finally {
      setIsSavingFarmForm(false)
    }
  }

  const handlePondSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmId) {
      showToast('error', L.alertSelectFarm)
      return
    }
    const names = pondForms.map((f) => f.name.trim()).filter(Boolean)
    if (names.length === 0) {
      showToast('error', L.alertAtLeastOnePondName)
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
        L.successPondsCreated(pondCount, selectedFarm?.name ?? ''),
      )
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setPondForms([{ name: '' }])
      setSelectedFarmId('')
      refetchHierarchy()
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : L.alertCreatePondsFailed,
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
    const raw = newName.trim()
    if (!raw) return
    setIsEditSaving(true)
    try {
      if (editingItem.type === 'farm') {
        const name = normalizeFarmNameForStore(raw)
        await farmApi.updateFarm(Number(editingItem.id), { name })
      } else {
        await pondApi.updatePond(Number(editingItem.id), { name: raw })
      }
      await refetchHierarchy()
      const displayName =
        editingItem.type === 'farm' ? normalizeFarmNameForStore(raw) : raw
      setSuccessMessage(
        L.successUpdated(
          editingItem.type === 'farm' ? 'ฟาร์ม' : 'บ่อ',
          displayName,
        ),
      )
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      setIsEditModalOpen(false)
      setEditingItem(null)
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : L.alertUpdateFailed,
      )
    } finally {
      setIsEditSaving(false)
    }
  }

  const onClientSelectChange = (value: string) => {
    setSelectedClientId(value)
    setSelectedFarmId('')
    setExpandedFarms([])
  }

  return {
    L,
    selectedClientId,
    setSelectedClientId: onClientSelectChange,
    clientList,
    clientListLoading,
    selectedClient,
    clientFarms,
    clientPonds,
    farmDropdownOptions,
    farmHierarchyLoading,
    activeTab,
    setActiveTab,
    showSuccessMessage,
    successMessage,
    expandedFarms,
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,
    farmForm,
    pondForms,
    selectedFarmId,
    setSelectedFarmId,
    handleFarmSubmit,
    handlePondSubmit,
    addPondForm,
    removePondForm,
    updatePondForm,
    handleFarmNameChange,
    toggleFarmExpansion,
    handleEditFarm,
    handleEditPond,
    handleSaveEdit,
    setFarmForm,
    setPondForms,
    isSavingFarmForm,
    isSavingPondForm,
    isEditSaving,
  }
}
