import { useState, useEffect, type FormEvent } from 'react'
import { useAuthQuery } from '../../../hooks/useAuth'
import { UserLevel } from '../../../constants/userLevel'
import {
  useFeedCollectionListQuery,
  useCreateFeedCollectionMutation,
  useCreateFeedPriceHistoryMutation,
  useUpdateFeedCollectionMutation,
} from '../../../hooks/useFeedCollection'
import type { FeedCollectionPageItem } from '../../../api/feedCollection'
import { FEED_TYPE_FRESH, FEED_TYPE_PELLET } from '../../../constants/feedType'
import type { FeedCollectionAddFormState } from '../../../components/feedCollections/FeedCollectionAddModal'
import type { FeedCollectionEditDetailsFormState } from '../../../components/feedCollections/FeedCollectionEditDetailsModal'
import type { FeedCollectionUpdatePriceFormState } from '../../../components/feedCollections/FeedCollectionUpdatePriceModal'
import {
  todayISO,
  toPriceUpdatedDateISO,
} from '../../../components/feedCollections/formUtils'

export function useFeedCollectionsPage() {
  const { data: user } = useAuthQuery()
  const isAdmin = user != null && user.userLevel >= UserLevel.ClientAdmin
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useFeedCollectionListQuery(
    searchTerm || undefined,
  )
  const items = data?.items ?? []

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdatePriceModalOpen, setIsUpdatePriceModalOpen] = useState(false)
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false)
  const [selectedFeed, setSelectedFeed] =
    useState<FeedCollectionPageItem | null>(null)
  const [feedActionMenu, setFeedActionMenu] = useState<{
    feedId: number
    top: number
    right: number
  } | null>(null)

  useEffect(() => {
    if (feedActionMenu === null) return
    const closeIfOutside = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (
        t?.closest?.('[data-feed-actions-menu]') ||
        t?.closest?.('[data-feed-actions-trigger]')
      ) {
        return
      }
      setFeedActionMenu(null)
    }
    document.addEventListener('mousedown', closeIfOutside)
    return () => document.removeEventListener('mousedown', closeIfOutside)
  }, [feedActionMenu])

  useEffect(() => {
    if (feedActionMenu === null) return
    const close = () => setFeedActionMenu(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [feedActionMenu])

  const emptyAddForm = (): FeedCollectionAddFormState => ({
    name: '',
    unit: '',
    feedType: FEED_TYPE_PELLET,
    fcr: '',
    price: '',
    effectiveDate: todayISO(),
  })

  const [addForm, setAddForm] =
    useState<FeedCollectionAddFormState>(emptyAddForm)
  const [editDetailsForm, setEditDetailsForm] =
    useState<FeedCollectionEditDetailsFormState>({
      id: 0,
      name: '',
      unit: '',
      feedType: FEED_TYPE_PELLET,
      fcr: '',
    })
  const [updatePriceForm, setUpdatePriceForm] =
    useState<FeedCollectionUpdatePriceFormState>({
      price: '',
      date: todayISO(),
    })

  const createMutation = useCreateFeedCollectionMutation()
  const createPriceMutation = useCreateFeedPriceHistoryMutation()
  const updateFeedMutation = useUpdateFeedCollectionMutation()

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault()
    const price = parseFloat(addForm.price)
    const fcrNum = parseFloat(addForm.fcr)
    createMutation.mutate(
      {
        name: addForm.name.trim(),
        unit: addForm.unit.trim(),
        feedType: addForm.feedType,
        fcr:
          addForm.fcr.trim() !== '' && !Number.isNaN(fcrNum)
            ? fcrNum
            : undefined,
        feedPriceHistories:
          price > 0 && !Number.isNaN(price)
            ? [
                {
                  price,
                  priceUpdatedDate: toPriceUpdatedDateISO(
                    addForm.effectiveDate,
                  ),
                },
              ]
            : undefined,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false)
          setAddForm(emptyAddForm())
        },
      },
    )
  }

  function handleUpdatePriceSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedFeed) return
    createPriceMutation.mutate(
      {
        feedCollectionId: selectedFeed.id,
        price: parseFloat(updatePriceForm.price),
        priceUpdatedDate: new Date(updatePriceForm.date).toISOString(),
      },
      {
        onSuccess: () => {
          setIsUpdatePriceModalOpen(false)
          setSelectedFeed(null)
        },
      },
    )
  }

  function openUpdatePriceModal(feed: FeedCollectionPageItem) {
    setSelectedFeed(feed)
    setUpdatePriceForm({
      price: feed.latestPrice?.toString() ?? '',
      date: todayISO(),
    })
    setIsUpdatePriceModalOpen(true)
  }

  function openEditDetailsModal(feed: FeedCollectionPageItem) {
    const ft =
      feed.feedType === FEED_TYPE_PELLET || feed.feedType === FEED_TYPE_FRESH
        ? feed.feedType
        : FEED_TYPE_PELLET
    setEditDetailsForm({
      id: feed.id,
      name: feed.name,
      unit: feed.unit,
      feedType: ft,
      fcr: feed.fcr != null ? String(feed.fcr) : '',
    })
    setIsEditDetailsModalOpen(true)
  }

  function handleEditDetailsSubmit(e: FormEvent) {
    e.preventDefault()
    const fcrNum = parseFloat(editDetailsForm.fcr)
    updateFeedMutation.mutate(
      {
        id: editDetailsForm.id,
        name: editDetailsForm.name.trim(),
        unit: editDetailsForm.unit.trim(),
        feedType: editDetailsForm.feedType,
        fcr:
          editDetailsForm.fcr.trim() !== '' && !Number.isNaN(fcrNum)
            ? fcrNum
            : undefined,
      },
      {
        onSuccess: () => setIsEditDetailsModalOpen(false),
      },
    )
  }

  function openAddModal() {
    createMutation.reset()
    setAddForm(emptyAddForm())
    setIsAddModalOpen(true)
  }

  return {
    isAdmin,
    searchTerm,
    setSearchTerm,
    items,
    isLoading,
    isAddModalOpen,
    setIsAddModalOpen,
    isUpdatePriceModalOpen,
    setIsUpdatePriceModalOpen,
    isEditDetailsModalOpen,
    setIsEditDetailsModalOpen,
    selectedFeed,
    feedActionMenu,
    setFeedActionMenu,
    addForm,
    setAddForm,
    editDetailsForm,
    setEditDetailsForm,
    updatePriceForm,
    setUpdatePriceForm,
    createMutation,
    createPriceMutation,
    updateFeedMutation,
    handleAddSubmit,
    handleUpdatePriceSubmit,
    handleEditDetailsSubmit,
    openUpdatePriceModal,
    openEditDetailsModal,
    openAddModal,
  }
}
