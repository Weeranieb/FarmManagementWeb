import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  merchantApi,
  type MerchantResponse,
  type CreateMerchantRequest,
  type UpdateMerchantRequest,
} from '../../../api/merchant'

export const MERCHANT_LIST_QUERY_KEY = ['merchants'] as const

export function useMerchantsListPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    contactNumber: '',
    location: '',
  })
  const [merchantToEdit, setMerchantToEdit] = useState<MerchantResponse | null>(
    null,
  )
  const [merchantToDelete, setMerchantToDelete] =
    useState<MerchantResponse | null>(null)

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: MERCHANT_LIST_QUERY_KEY,
    queryFn: () => merchantApi.getMerchantList(),
  })

  const createMutation = useMutation({
    mutationFn: (body: CreateMerchantRequest) =>
      merchantApi.createMerchant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LIST_QUERY_KEY })
      setIsAddModalOpen(false)
      setAddFormData({ name: '', contactNumber: '', location: '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (body: UpdateMerchantRequest) =>
      merchantApi.updateMerchant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LIST_QUERY_KEY })
      setMerchantToEdit(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => merchantApi.deleteMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LIST_QUERY_KEY })
      setMerchantToDelete(null)
    },
  })

  const filteredMerchants = merchants.filter((merchant) => {
    const term = searchTerm.toLowerCase()
    return (
      merchant.name.toLowerCase().includes(term) ||
      (merchant.contactNumber &&
        merchant.contactNumber.toLowerCase().includes(term)) ||
      (merchant.location && merchant.location.toLowerCase().includes(term))
    )
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name: addFormData.name,
      contactNumber: addFormData.contactNumber,
      location: addFormData.location,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchantToEdit) return
    updateMutation.mutate({
      id: merchantToEdit.id,
      name: merchantToEdit.name,
      contactNumber: merchantToEdit.contactNumber,
      location: merchantToEdit.location,
    })
  }

  const handleDeleteConfirm = () => {
    if (!merchantToDelete) return
    deleteMutation.mutate(merchantToDelete.id)
  }

  return {
    searchTerm,
    setSearchTerm,
    isAddModalOpen,
    setIsAddModalOpen,
    addFormData,
    setAddFormData,
    merchantToEdit,
    setMerchantToEdit,
    merchantToDelete,
    setMerchantToDelete,
    isLoading,
    filteredMerchants,
    createMutation,
    updateMutation,
    deleteMutation,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
  }
}
