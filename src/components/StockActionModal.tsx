import {
  X,
  Fish,
  Package,
  Weight,
  DollarSign,
  ArrowRight,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { mockPonds } from '../data/mockData'
import type { Pond } from '../data/mockData'
import { th } from '../locales/th'

const L = th.stockActionModal

type ActionType = 'add' | 'transfer' | 'sell'

export interface StockActionModalPond {
  id: string | number
  name: string
  code?: string
  farmName?: string
  status?: string
  currentStock?: number
  species?: string[]
}

interface AdditionalCost {
  id: string
  category: string
  cost: number
}

interface SellRow {
  id: string
  quantity: number
  avgWeight: number
  pricePerKg: number
}

interface SpeciesSellData {
  id: string
  species: string
  rows: SellRow[]
}

interface StockActionModalProps {
  pond: StockActionModalPond | null
  isOpen: boolean
  onClose: () => void
  availablePonds?: StockActionModalPond[]
}

export function StockActionModal({
  pond: pondProp,
  isOpen,
  onClose,
  availablePonds,
}: StockActionModalProps) {
  const [actionType, setActionType] = useState<ActionType>('add')
  const [quantity, setQuantity] = useState<number>(0)
  const [avgWeight, setAvgWeight] = useState<number>(0)
  const [pricePerUnit, setPricePerUnit] = useState<number>(0)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [destinationPondId, setDestinationPondId] = useState<string>('')
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([])
  const [speciesSellData, setSpeciesSellData] = useState<SpeciesSellData[]>([])
  const [buyer, setBuyer] = useState<string>('')
  const [closePond, setClosePond] = useState<boolean>(false)

  const pond = useMemo(():
    | (StockActionModalPond & {
        currentStock: number
        species: string[]
        code: string
      })
    | null => {
    if (!pondProp) return null
    return {
      ...pondProp,
      currentStock: pondProp.currentStock ?? 0,
      species: pondProp.species ?? [],
      code: pondProp.code ?? '',
    }
  }, [pondProp])

  const buyerOptions = L.buyerOptions

  const mockPondsNormalized = useMemo(
    (): StockActionModalPond[] =>
      mockPonds.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        farmName: p.farmName,
        status: p.status,
        currentStock: p.currentStock,
        species: (p as Pond & { species?: string[] }).species ?? [],
      })),
    [],
  )

  const availablePondsForTransfer = useMemo(() => {
    const list = availablePonds ?? mockPondsNormalized
    if (!pond) return list
    return list.filter(
      (p) =>
        String(p.id) !== String(pond.id) &&
        (p.status === 'active' || p.status === undefined),
    )
  }, [pond, availablePonds, mockPondsNormalized])

  const destinationPond = useMemo(() => {
    if (!destinationPondId) return null
    return (
      availablePondsForTransfer.find(
        (p) => String(p.id) === destinationPondId,
      ) ?? null
    )
  }, [destinationPondId, availablePondsForTransfer])

  const totalCost = quantity * pricePerUnit
  const totalWeight = quantity * avgWeight

  const remainingStock = useMemo(() => {
    if (!pond) return 0
    if (actionType === 'add') {
      return pond.currentStock + quantity
    }
    return pond.currentStock - quantity
  }, [actionType, pond, quantity])

  const stockPercentage = useMemo(() => {
    if (!pond || pond.currentStock === 0) return 0
    return (quantity / pond.currentStock) * 100
  }, [quantity, pond])

  const speciesTotal = useMemo(() => {
    return speciesSellData.map((speciesData) => {
      const totalQuantity = speciesData.rows.reduce(
        (sum, row) => sum + row.quantity,
        0,
      )
      const totalWeight = speciesData.rows.reduce(
        (sum, row) => sum + row.quantity * row.avgWeight,
        0,
      )
      const totalRevenue = speciesData.rows.reduce(
        (sum, row) => sum + row.quantity * row.avgWeight * row.pricePerKg,
        0,
      )
      return {
        speciesId: speciesData.id,
        species: speciesData.species,
        totalQuantity,
        totalWeight,
        totalRevenue,
      }
    })
  }, [speciesSellData])

  const grandTotals = useMemo(() => {
    const totalQuantity = speciesTotal.reduce(
      (sum, st) => sum + st.totalQuantity,
      0,
    )
    const totalWeight = speciesTotal.reduce(
      (sum, st) => sum + st.totalWeight,
      0,
    )
    const totalRevenue = speciesTotal.reduce(
      (sum, st) => sum + st.totalRevenue,
      0,
    )
    return { totalQuantity, totalWeight, totalRevenue }
  }, [speciesTotal])

  const showWarning =
    (actionType === 'transfer' || actionType === 'sell') && stockPercentage > 50

  if (!isOpen || !pond) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onClose()
  }

  const resetForm = () => {
    setQuantity(0)
    setAvgWeight(0)
    setPricePerUnit(0)
    setSelectedSpecies('')
    setDestinationPondId('')
    setAdditionalCosts([])
    setSpeciesSellData([])
    setBuyer('')
    setClosePond(false)
  }

  const handleActionTypeChange = (type: ActionType) => {
    setActionType(type)
    resetForm()
  }

  const getButtonLabel = () => {
    switch (actionType) {
      case 'add':
        return L.addStock
      case 'transfer':
        return L.transfer
      case 'sell':
        return L.sellStock
    }
  }

  const getButtonColor = () => {
    switch (actionType) {
      case 'add':
        return 'from-green-700 to-green-600 hover:shadow-green-200'
      case 'transfer':
        return 'from-blue-800 to-blue-600 hover:shadow-blue-200'
      case 'sell':
        return 'from-purple-700 to-purple-600 hover:shadow-purple-200'
    }
  }

  const handleAddAdditionalCost = () => {
    const newCost: AdditionalCost = {
      id: `cost-${additionalCosts.length + 1}`,
      category: '',
      cost: 0,
    }
    setAdditionalCosts([...additionalCosts, newCost])
  }

  const handleRemoveAdditionalCost = (id: string) => {
    setAdditionalCosts(additionalCosts.filter((cost) => cost.id !== id))
  }

  const handleAdditionalCostChange = (
    id: string,
    field: 'category' | 'cost',
    value: string,
  ) => {
    setAdditionalCosts(
      additionalCosts.map((cost) =>
        cost.id === id
          ? {
              ...cost,
              [field]: field === 'cost' ? parseFloat(value) || 0 : value,
            }
          : cost,
      ),
    )
  }

  const handleAddSpecies = () => {
    if (!pond) return
    const availableSpecies = pond.species.filter(
      (s) => !speciesSellData.some((data) => data.species === s),
    )
    if (availableSpecies.length === 0) return
    const newSpeciesData: SpeciesSellData = {
      id: `species-${speciesSellData.length + 1}`,
      species: availableSpecies[0],
      rows: [{ id: 'row-1', quantity: 0, avgWeight: 0, pricePerKg: 0 }],
    }
    setSpeciesSellData([...speciesSellData, newSpeciesData])
  }

  const handleRemoveSpecies = (speciesId: string) => {
    setSpeciesSellData(speciesSellData.filter((data) => data.id !== speciesId))
  }

  const handleSpeciesChange = (speciesId: string, newSpecies: string) => {
    setSpeciesSellData(
      speciesSellData.map((data) =>
        data.id === speciesId ? { ...data, species: newSpecies } : data,
      ),
    )
  }

  const handleAddSpeciesRow = (speciesId: string) => {
    setSpeciesSellData(
      speciesSellData.map((data) => {
        if (data.id === speciesId) {
          const newRow: SellRow = {
            id: `row-${data.rows.length + 1}`,
            quantity: 0,
            avgWeight: 0,
            pricePerKg: 0,
          }
          return { ...data, rows: [...data.rows, newRow] }
        }
        return data
      }),
    )
  }

  const handleRemoveSpeciesRow = (speciesId: string, rowId: string) => {
    setSpeciesSellData(
      speciesSellData.map((data) => {
        if (data.id === speciesId) {
          return {
            ...data,
            rows: data.rows.filter((row) => row.id !== rowId),
          }
        }
        return data
      }),
    )
  }

  const handleSpeciesRowChange = (
    speciesId: string,
    rowId: string,
    field: 'quantity' | 'avgWeight' | 'pricePerKg',
    value: string,
  ) => {
    setSpeciesSellData(
      speciesSellData.map((data) => {
        if (data.id === speciesId) {
          return {
            ...data,
            rows: data.rows.map((row) =>
              row.id === rowId
                ? { ...row, [field]: parseFloat(value) || 0 }
                : row,
            ),
          }
        }
        return data
      }),
    )
  }

  const destinationCurrentStock = (destinationPond?.currentStock ?? 0) as number

  return (
    <>
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity'
        onClick={onClose}
        aria-hidden
      />
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all'
          role='dialog'
          aria-modal='true'
          aria-labelledby='stock-action-modal-title'
        >
          <div className='px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10'>
            <div className='flex items-center justify-between'>
              <div>
                <h2
                  id='stock-action-modal-title'
                  className='text-xl font-semibold text-gray-900'
                >
                  {L.title}
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  <span className='font-medium text-blue-600'>{pond.name}</span>
                </p>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                aria-label={L.ariaClose}
              >
                <X size={20} className='text-gray-500' />
              </button>
            </div>
            <div className='mt-5 grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg'>
              <button
                type='button'
                onClick={() => handleActionTypeChange('add')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  actionType === 'add'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp size={16} />
                {L.addStock}
              </button>
              <button
                type='button'
                onClick={() => handleActionTypeChange('transfer')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  actionType === 'transfer'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowRight size={16} />
                {L.transfer}
              </button>
              <button
                type='button'
                onClick={() => handleActionTypeChange('sell')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  actionType === 'sell'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingCart size={16} />
                {L.sellStock}
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            {actionType !== 'transfer' && (
              <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-600 rounded-lg'>
                      <Fish size={20} className='text-white' />
                    </div>
                    <div>
                      <p className='text-xs text-blue-700 font-medium'>
                        {L.currentStock}
                      </p>
                      <p className='text-xl font-bold text-blue-900'>
                        {pond.currentStock.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-blue-700 font-medium'>
                      {L.speciesAvailable}
                    </p>
                    <div className='flex gap-1 mt-1 justify-end'>
                      {pond.species.length > 0 ? (
                        pond.species.map((species, index) => (
                          <span
                            key={index}
                            className='text-xs px-2 py-1 bg-white text-blue-700 rounded border border-blue-200 font-medium'
                          >
                            {species}
                          </span>
                        ))
                      ) : (
                        <span className='text-xs text-gray-500'>—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'transfer' && (
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='p-2 bg-blue-600 rounded-lg'>
                      <Fish size={20} className='text-white' />
                    </div>
                    <div>
                      <p className='text-xs text-blue-700 font-medium'>
                        Source Pond
                      </p>
                      <p className='text-sm font-semibold text-blue-900'>
                        {pond.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className='text-xs text-blue-700 font-medium mb-2'>
                      {L.currentStock}
                    </p>
                    {quantity > 0 ? (
                      <div className='flex items-center gap-2'>
                        <p className='text-2xl font-bold text-blue-900'>
                          {pond.currentStock.toLocaleString()}
                        </p>
                        <ArrowRight
                          size={20}
                          className='text-blue-600 flex-shrink-0'
                        />
                        <p className='text-2xl font-bold text-blue-600'>
                          {remainingStock.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className='text-2xl font-bold text-blue-900'>
                        {pond.currentStock.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-4 border ${
                    destinationPond
                      ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
                      : 'bg-gray-50 border-gray-200 border-dashed'
                  }`}
                >
                  {destinationPond ? (
                    <>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='p-2 bg-green-600 rounded-lg'>
                          <Fish size={20} className='text-white' />
                        </div>
                        <div>
                          <p className='text-xs text-green-700 font-medium'>
                            {L.destinationPond}
                          </p>
                          <p className='text-sm font-semibold text-green-900'>
                            {destinationPond.name}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className='text-xs text-green-700 font-medium mb-2'>
                          {L.currentStock}
                        </p>
                        {quantity > 0 ? (
                          <div className='flex items-center gap-2'>
                            <p className='text-2xl font-bold text-green-900'>
                              {destinationCurrentStock.toLocaleString()}
                            </p>
                            <ArrowRight
                              size={20}
                              className='text-green-600 flex-shrink-0'
                            />
                            <p className='text-2xl font-bold text-green-600'>
                              {(
                                destinationCurrentStock + quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className='text-2xl font-bold text-green-900'>
                            {destinationCurrentStock.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <p className='text-sm text-gray-500'>
                        {L.selectDestinationPond}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {actionType !== 'sell' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {L.species} *
                </label>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  required={pond.species.length > 0}
                >
                  <option value=''>{L.selectSpecies}</option>
                  {pond.species.map((species, index) => (
                    <option key={index} value={species}>
                      {species}
                    </option>
                  ))}
                </select>
                {pond.species.length === 0 && (
                  <p className='text-sm text-gray-500 mt-1'>
                    {L.noSpeciesData}
                  </p>
                )}
              </div>
            )}

            {actionType !== 'sell' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {L.quantity} *
                </label>
                <div className='relative'>
                  <Package
                    size={18}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  />
                  <input
                    type='number'
                    placeholder={L.enterQuantity}
                    min='1'
                    max={actionType !== 'add' ? pond.currentStock : undefined}
                    value={quantity || ''}
                    onChange={(e) =>
                      setQuantity(parseInt(e.target.value, 10) || 0)
                    }
                    className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                    required
                  />
                </div>
                {actionType !== 'add' && quantity > pond.currentStock && (
                  <p className='text-sm text-red-600 mt-1'>
                    {L.quantityExceeds}
                    {pond.currentStock.toLocaleString()})
                  </p>
                )}
              </div>
            )}

            {actionType === 'transfer' && (
              <>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {L.fromPond}
                    </label>
                    <input
                      type='text'
                      value={pond.name}
                      readOnly
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {L.toPond} *
                    </label>
                    <select
                      value={destinationPondId}
                      onChange={(e) => setDestinationPondId(e.target.value)}
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                      required
                    >
                      <option value=''>{L.selectDestinationPondOption}</option>
                      {availablePondsForTransfer.map((p) => (
                        <option key={String(p.id)} value={String(p.id)}>
                          {p.name} ({p.farmName ?? ''})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {L.avgWeightKg} *
                  </label>
                  <div className='relative'>
                    <Weight
                      size={18}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                      value={avgWeight || ''}
                      onChange={(e) =>
                        setAvgWeight(parseFloat(e.target.value) || 0)
                      }
                      className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                      required
                    />
                  </div>
                  {avgWeight > 0 && quantity > 0 && (
                    <p className='text-sm text-gray-600 mt-1'>
                      {L.totalWeight}:{' '}
                      <span className='font-medium'>
                        {totalWeight.toFixed(2)} {L.unitKg}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {L.costPerUnitThb} *
                  </label>
                  <div className='relative'>
                    <DollarSign
                      size={18}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                      value={pricePerUnit || ''}
                      onChange={(e) =>
                        setPricePerUnit(parseFloat(e.target.value) || 0)
                      }
                      className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                      required
                    />
                  </div>
                  {pricePerUnit > 0 && quantity > 0 && (
                    <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          {L.totalTransferCost}
                        </span>
                        <span className='text-lg font-semibold text-gray-900'>
                          {L.currencySymbol}
                          {totalCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className='border-t border-gray-200 pt-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <label className='block text-sm font-medium text-gray-700'>
                      {L.additionalCosts}
                    </label>
                    <button
                      type='button'
                      onClick={handleAddAdditionalCost}
                      className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                    >
                      <Plus size={16} />
                      {L.addCost}
                    </button>
                  </div>
                  {additionalCosts.length > 0 && (
                    <div className='space-y-3'>
                      {additionalCosts.map((cost) => (
                        <div key={cost.id} className='flex gap-3 items-start'>
                          <div className='flex-1'>
                            <input
                              type='text'
                              placeholder={L.categoryPlaceholder}
                              value={cost.category}
                              onChange={(e) =>
                                handleAdditionalCostChange(
                                  cost.id,
                                  'category',
                                  e.target.value,
                                )
                              }
                              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                            />
                          </div>
                          <div className='w-32'>
                            <div className='relative'>
                              <DollarSign
                                size={16}
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                              />
                              <input
                                type='number'
                                placeholder='0.00'
                                step='0.01'
                                min='0'
                                value={cost.cost || ''}
                                onChange={(e) =>
                                  handleAdditionalCostChange(
                                    cost.id,
                                    'cost',
                                    e.target.value,
                                  )
                                }
                                className='w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                              />
                            </div>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleRemoveAdditionalCost(cost.id)}
                            className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title={L.removeCost}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {additionalCosts.length === 0 && (
                    <div className='text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                      <p className='text-sm text-gray-500'>
                        {L.noAdditionalCosts}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {actionType === 'add' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {L.avgWeightKg}
                </label>
                <div className='relative'>
                  <Weight
                    size={18}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  />
                  <input
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    value={avgWeight || ''}
                    onChange={(e) =>
                      setAvgWeight(parseFloat(e.target.value) || 0)
                    }
                    className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  />
                </div>
                {avgWeight > 0 && quantity > 0 && (
                  <p className='text-sm text-gray-600 mt-1'>
                    {L.totalWeight}:{' '}
                    <span className='font-medium'>
                      {totalWeight.toFixed(2)} {L.unitKg}
                    </span>
                  </p>
                )}
              </div>
            )}

            {actionType === 'add' && (
              <>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {L.costPerUnitThb} *
                  </label>
                  <div className='relative'>
                    <DollarSign
                      size={18}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='number'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                      value={pricePerUnit || ''}
                      onChange={(e) =>
                        setPricePerUnit(parseFloat(e.target.value) || 0)
                      }
                      className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                      required
                    />
                  </div>
                  {pricePerUnit > 0 && quantity > 0 && (
                    <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          {L.totalCost}
                        </span>
                        <span className='text-lg font-semibold text-gray-900'>
                          {L.currencySymbol}
                          {totalCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className='border-t border-gray-200 pt-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <label className='block text-sm font-medium text-gray-700'>
                      {L.additionalCosts}
                    </label>
                    <button
                      type='button'
                      onClick={handleAddAdditionalCost}
                      className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                    >
                      <Plus size={16} />
                      {L.addCost}
                    </button>
                  </div>
                  {additionalCosts.length > 0 && (
                    <div className='space-y-3'>
                      {additionalCosts.map((cost) => (
                        <div key={cost.id} className='flex gap-3 items-start'>
                          <div className='flex-1'>
                            <input
                              type='text'
                              placeholder={L.categoryPlaceholder}
                              value={cost.category}
                              onChange={(e) =>
                                handleAdditionalCostChange(
                                  cost.id,
                                  'category',
                                  e.target.value,
                                )
                              }
                              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                            />
                          </div>
                          <div className='w-32'>
                            <div className='relative'>
                              <DollarSign
                                size={16}
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                              />
                              <input
                                type='number'
                                placeholder='0.00'
                                step='0.01'
                                min='0'
                                value={cost.cost || ''}
                                onChange={(e) =>
                                  handleAdditionalCostChange(
                                    cost.id,
                                    'cost',
                                    e.target.value,
                                  )
                                }
                                className='w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                              />
                            </div>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleRemoveAdditionalCost(cost.id)}
                            className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title={L.removeCost}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {additionalCosts.length === 0 && (
                    <div className='text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                      <p className='text-sm text-gray-500'>
                        {L.noAdditionalCosts}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {actionType === 'sell' && (
              <>
                <div className='border-t border-gray-200 pt-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <label className='block text-sm font-medium text-gray-700'>
                      {L.speciesToSell}
                    </label>
                    <button
                      type='button'
                      onClick={handleAddSpecies}
                      disabled={pond.species.length === speciesSellData.length}
                      className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Plus size={16} />
                      {L.addSpecies}
                    </button>
                  </div>
                  {speciesSellData.length > 0 && (
                    <div className='space-y-6'>
                      {speciesSellData.map((speciesData) => {
                        const total = speciesTotal.find(
                          (st) => st.speciesId === speciesData.id,
                        )
                        const availableSpeciesOptions = pond.species.filter(
                          (s) =>
                            s === speciesData.species ||
                            !speciesSellData.some((data) => data.species === s),
                        )
                        return (
                          <div
                            key={speciesData.id}
                            className='bg-gray-50 rounded-lg p-4 border border-gray-300'
                          >
                            <div className='flex items-center gap-3 mb-4'>
                              <div className='flex-1'>
                                <select
                                  value={speciesData.species}
                                  onChange={(e) =>
                                    handleSpeciesChange(
                                      speciesData.id,
                                      e.target.value,
                                    )
                                  }
                                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white font-medium text-gray-900'
                                >
                                  {availableSpeciesOptions.map(
                                    (species, index) => (
                                      <option key={index} value={species}>
                                        {species}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </div>
                              <button
                                type='button'
                                onClick={() =>
                                  handleRemoveSpecies(speciesData.id)
                                }
                                className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                title={L.removeSpecies}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className='space-y-3 mb-3'>
                              {speciesData.rows.map((row) => (
                                <div
                                  key={row.id}
                                  className='flex gap-3 items-start'
                                >
                                  <div className='flex-1'>
                                    <div className='relative'>
                                      <Package
                                        size={16}
                                        className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                                      />
                                      <input
                                        type='number'
                                        placeholder={L.quantityPlaceholder}
                                        step='1'
                                        min='0'
                                        value={row.quantity || ''}
                                        onChange={(e) =>
                                          handleSpeciesRowChange(
                                            speciesData.id,
                                            row.id,
                                            'quantity',
                                            e.target.value,
                                          )
                                        }
                                        className='w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white'
                                      />
                                    </div>
                                  </div>
                                  <div className='flex-1'>
                                    <div className='relative'>
                                      <Weight
                                        size={16}
                                        className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                                      />
                                      <input
                                        type='number'
                                        placeholder={L.avgWeightKg}
                                        step='0.01'
                                        min='0'
                                        value={row.avgWeight || ''}
                                        onChange={(e) =>
                                          handleSpeciesRowChange(
                                            speciesData.id,
                                            row.id,
                                            'avgWeight',
                                            e.target.value,
                                          )
                                        }
                                        className='w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white'
                                      />
                                    </div>
                                  </div>
                                  <div className='flex-1'>
                                    <div className='relative'>
                                      <DollarSign
                                        size={16}
                                        className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                                      />
                                      <input
                                        type='number'
                                        placeholder={L.pricePerKgThb}
                                        step='0.01'
                                        min='0'
                                        value={row.pricePerKg || ''}
                                        onChange={(e) =>
                                          handleSpeciesRowChange(
                                            speciesData.id,
                                            row.id,
                                            'pricePerKg',
                                            e.target.value,
                                          )
                                        }
                                        className='w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white'
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() =>
                                      handleRemoveSpeciesRow(
                                        speciesData.id,
                                        row.id,
                                      )
                                    }
                                    disabled={speciesData.rows.length === 1}
                                    className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed'
                                    title={L.removeRow}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type='button'
                              onClick={() =>
                                handleAddSpeciesRow(speciesData.id)
                              }
                              className='w-full py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-dashed border-purple-300'
                            >
                              {L.addSizeRow}
                            </button>
                            {total && total.totalQuantity > 0 && (
                              <div className='mt-3 pt-3 border-t border-gray-300'>
                                <p className='text-xs text-gray-600 font-medium mb-2'>
                                  {speciesData.species} {L.summary}
                                </p>
                                <div className='grid grid-cols-3 gap-3 text-sm'>
                                  <div>
                                    <p className='text-xs text-gray-500'>
                                      {L.quantity}
                                    </p>
                                    <p className='font-semibold text-gray-900'>
                                      {total.totalQuantity.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-xs text-gray-500'>
                                      {L.totalWeightLabel}
                                    </p>
                                    <p className='font-semibold text-gray-900'>
                                      {total.totalWeight.toFixed(2)} {L.unitKg}
                                    </p>
                                  </div>
                                  <div>
                                    <p className='text-xs text-gray-500'>
                                      {L.totalRevenueLabel}
                                    </p>
                                    <p className='font-semibold text-gray-900'>
                                      {L.currencySymbol}
                                      {total.totalRevenue.toLocaleString(
                                        undefined,
                                        { minimumFractionDigits: 2 },
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {speciesSellData.length === 0 && (
                    <div className='text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                      <Fish size={40} className='mx-auto text-gray-400 mb-2' />
                      <p className='text-sm text-gray-500 mb-3'>
                        {L.noSpeciesAddedForSale}
                      </p>
                      <button
                        type='button'
                        onClick={handleAddSpecies}
                        className='px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-300'
                      >
                        <Plus size={16} className='inline mr-1' />
                        {L.addSpeciesToSell}
                      </button>
                    </div>
                  )}
                </div>
                {speciesSellData.length > 1 &&
                  grandTotals.totalQuantity > 0 && (
                    <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200'>
                      <p className='text-xs text-purple-700 font-medium mb-3'>
                        {L.grandTotalAllSpecies}
                      </p>
                      <div className='grid grid-cols-3 gap-4'>
                        <div>
                          <p className='text-xs text-purple-700 font-medium mb-1'>
                            {L.totalQuantity}
                          </p>
                          <p className='text-xl font-bold text-purple-900'>
                            {grandTotals.totalQuantity.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-purple-700 font-medium mb-1'>
                            {L.totalWeightLabel}
                          </p>
                          <p className='text-xl font-bold text-purple-900'>
                            {grandTotals.totalWeight.toFixed(2)} {L.unitKg}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-purple-700 font-medium mb-1'>
                            {L.totalRevenueLabel}
                          </p>
                          <p className='text-xl font-bold text-purple-900'>
                            {L.currencySymbol}
                            {grandTotals.totalRevenue.toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                {speciesSellData.length === 1 &&
                  grandTotals.totalQuantity > 0 && (
                    <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200'>
                      <p className='text-xs text-purple-700 font-medium mb-3'>
                        {L.saleSummary}
                      </p>
                      <div className='grid grid-cols-3 gap-4'>
                        <div>
                          <p className='text-xs text-purple-700 font-medium mb-1'>
                            {L.totalQuantity}
                          </p>
                          <p className='text-xl font-bold text-purple-900'>
                            {grandTotals.totalQuantity.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-purple-700 font-medium mb-1'>
                            {L.totalWeightLabel}
                          </p>
                          <p className='text-xl font-bold text-purple-900'>
                            {grandTotals.totalWeight.toFixed(2)} {L.unitKg}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-purple-700 font-medium mb-1'>
                            {L.totalRevenueLabel}
                          </p>
                          <p className='text-xl font-bold text-purple-900'>
                            {L.currencySymbol}
                            {grandTotals.totalRevenue.toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {L.buyerMarket}
                  </label>
                  <select
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  >
                    <option value=''>{L.selectBuyerMarket}</option>
                    {buyerOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {actionType === 'add'
                  ? L.stockDate
                  : actionType === 'transfer'
                    ? L.transferDate
                    : L.saleDate}{' '}
                *
              </label>
              <input
                type='date'
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {quantity > 0 &&
              (actionType === 'transfer' ||
                actionType === 'sell' ||
                actionType === 'add') && (
                <div className='border-t border-gray-200 pt-5'>
                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        {L.stockPreview}
                      </span>
                      {showWarning && (
                        <span className='flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200'>
                          <AlertTriangle size={12} />
                          {actionType === 'transfer'
                            ? L.largeTransfer
                            : L.largeSale}
                          {L.largeActionPercent(
                            Number(stockPercentage.toFixed(0)),
                          )}
                        </span>
                      )}
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                      <div>
                        <p className='text-xs text-gray-600'>{L.current}</p>
                        <p className='text-lg font-semibold text-gray-900'>
                          {pond.currentStock.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-600'>
                          {actionType === 'add' ? L.adding : L.removing}
                        </p>
                        <p
                          className={`text-lg font-semibold ${actionType === 'add' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {actionType === 'add' ? '+' : '-'}
                          {quantity.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-600'>{L.afterAction}</p>
                        <p className='text-lg font-semibold text-blue-600'>
                          {remainingStock.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {(actionType === 'sell' || actionType === 'transfer') && (
              <div className='border-t border-gray-200 pt-5'>
                <div className='bg-amber-50 rounded-lg p-4 border border-amber-200'>
                  <label className='flex items-start gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={closePond}
                      onChange={(e) => setClosePond(e.target.checked)}
                      className='mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-gray-900'>
                          {actionType === 'sell'
                            ? L.closePondAfterSale
                            : L.closePondAfterTransfer}
                        </span>
                        <span className='px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded'>
                          {L.maintenance}
                        </span>
                      </div>
                      <p className='text-xs text-gray-600 mt-1'>
                        {L.closePondDescription}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {L.notes}
              </label>
              <textarea
                rows={3}
                placeholder={L.notesPlaceholder}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none'
              />
            </div>

            <div className='flex items-center justify-end gap-3 pt-4 border-t border-gray-200'>
              <button
                type='button'
                onClick={onClose}
                className='px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors'
              >
                {L.cancel}
              </button>
              <button
                type='submit'
                disabled={
                  (actionType !== 'add' && quantity > pond.currentStock) ||
                  (actionType === 'sell' && speciesSellData.length === 0)
                }
                className={`px-5 py-2.5 bg-gradient-to-r ${getButtonColor()} text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {getButtonLabel()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
