import {
  Fish,
  Package,
  Weight,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react'
import { th } from '../../locales/th'
import { formatPondDisplayNameTH } from '../../utils/masterDataName'
import { DatePicker } from '../DatePicker'
import type { StockActionModalProps } from './types'
import { ConfirmationView } from './confirmation/ConfirmationView'
import { AdditionalCostsSection } from './AdditionalCostsSection'
import { StockActionModalHeader } from './StockActionModalHeader'
import { CurrentStockSummary } from './panels/CurrentStockSummary'
import { TransferPondCards } from './panels/TransferPondCards'
import { useStockActionModal } from './useStockActionModal'

const L = th.stockActionModal
const fishTypeLabels = th.fishType

export function StockActionModal({
  pond: pondProp,
  isOpen,
  onClose,
  availablePonds,
  initialActionType = 'add',
  onFillSuccess,
}: StockActionModalProps) {
  const m = useStockActionModal({
    pond: pondProp,
    isOpen,
    onClose,
    availablePonds,
    initialActionType,
    onFillSuccess,
  })
  if (!isOpen || !m.pond) return null
  const {
    actionType,
    quantity,
    setQuantity,
    avgWeight,
    setAvgWeight,
    pricePerUnit,
    setPricePerUnit,
    avgWeightNum,
    pricePerUnitNum,
    selectedSpecies,
    setSelectedSpecies,
    destinationPondId,
    setDestinationPondId,
    additionalCosts,
    sellGradeRows,
    buyer,
    setBuyer,
    closePond,
    setClosePond,
    activityDate,
    setActivityDate,
    notes,
    setNotes,
    submitError,
    setSubmitError,
    isSubmitting,
    fieldErrors,
    setFieldErrors,
    showConfirmation,
    setShowConfirmation,
    previewResult,
    V,
    clearFieldError,
    pond,
    isMaintenanceBlocked,
    speciesOptions,
    merchants,
    fishSizeGrades,
    availablePondsForTransfer,
    destinationPond,
    totalCost,
    totalWeight,
    remainingStock,
    stockPercentage,
    sellTotals,
    showWarning,
    isFormValid,
    handleSubmit,
    handleConfirmedSubmit,
    handleActionTypeChange,
    getReviewButtonLabel,
    getConfirmButtonLabel,
    getButtonColor,
    handleAddAdditionalCost,
    handleRemoveAdditionalCost,
    handleAdditionalCostChange,
    handleAddSellGradeRow,
    handleRemoveSellGradeRow,
    handleSellGradeRowChange,
    destinationCurrentStock,
  } = m

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
          <StockActionModalHeader
            pondName={pond.name}
            onClose={onClose}
            showConfirmation={showConfirmation}
            actionType={actionType}
            onActionTypeChange={handleActionTypeChange}
          />
          {showConfirmation && previewResult ? (
            <ConfirmationView
              actionType={actionType}
              pond={pond}
              previewResult={previewResult}
              destinationPond={destinationPond}
              activityDate={activityDate}
              closePond={closePond}
              notes={notes}
              buyer={buyer}
              merchants={merchants}
              submitError={submitError}
              isSubmitting={isSubmitting}
              onBack={() => {
                setShowConfirmation(false)
                setSubmitError(null)
              }}
              onConfirm={handleConfirmedSubmit}
              getConfirmButtonLabel={getConfirmButtonLabel}
              getButtonColor={getButtonColor}
            />
          ) : (
            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              {isMaintenanceBlocked ? (
                <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800'>
                  <AlertTriangle size={24} className='shrink-0' />
                  <p className='font-medium'>{L.cannotMoveOrSellMaintenance}</p>
                </div>
              ) : (
                <>
                  {actionType !== 'transfer' && (
                    <CurrentStockSummary pond={pond} />
                  )}

                  {actionType === 'transfer' && (
                    <TransferPondCards
                      pond={pond}
                      quantity={quantity}
                      remainingStock={remainingStock}
                      destinationPond={destinationPond}
                      destinationCurrentStock={destinationCurrentStock}
                    />
                  )}

                  {actionType !== 'sell' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {L.species} *
                      </label>
                      <select
                        value={selectedSpecies}
                        onChange={(e) => {
                          setSelectedSpecies(e.target.value)
                          clearFieldError('species')
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                          fieldErrors.species
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value=''>
                          {actionType === 'transfer' &&
                          speciesOptions.length === 0
                            ? L.noSpeciesInSource
                            : L.selectSpecies}
                        </option>
                        {speciesOptions.map((value) => (
                          <option key={value} value={value}>
                            {fishTypeLabels[
                              value as keyof typeof fishTypeLabels
                            ] ?? value}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.species && (
                        <p className='text-sm text-red-600 mt-1' role='alert'>
                          {fieldErrors.species}
                        </p>
                      )}
                    </div>
                  )}

                  {actionType !== 'sell' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {L.quantityAddUnit} *
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
                          max={
                            actionType !== 'add' ? pond.currentStock : undefined
                          }
                          value={quantity || ''}
                          onChange={(e) => {
                            const v = e.target.value
                            const n = v === '' ? 0 : parseInt(v, 10)
                            if (v !== '' && Number.isNaN(n)) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                quantity: V.mustBeNumber,
                              }))
                              setQuantity(0)
                            } else {
                              setQuantity(Number.isNaN(n) ? 0 : n)
                              clearFieldError('quantity')
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                            fieldErrors.quantity
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      {fieldErrors.quantity && (
                        <p className='text-sm text-red-600 mt-1' role='alert'>
                          {fieldErrors.quantity}
                        </p>
                      )}
                      {!fieldErrors.quantity &&
                        actionType !== 'add' &&
                        quantity > pond.currentStock && (
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
                            disabled
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            {L.toPond} *
                          </label>
                          <select
                            value={destinationPondId}
                            onChange={(e) => {
                              setDestinationPondId(e.target.value)
                              clearFieldError('destinationPondId')
                            }}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.destinationPondId
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value=''>
                              {L.selectDestinationPondOption}
                            </option>
                            {availablePondsForTransfer.map((p) => (
                              <option key={String(p.id)} value={String(p.id)}>
                                {formatPondDisplayNameTH(p.name)}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.destinationPondId && (
                            <p
                              className='text-sm text-red-600 mt-1'
                              role='alert'
                            >
                              {fieldErrors.destinationPondId}
                            </p>
                          )}
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
                            value={avgWeight ?? ''}
                            onChange={(e) => {
                              setAvgWeight(
                                e.target.value === '' ? null : e.target.value,
                              )
                              clearFieldError('avgWeight')
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.avgWeight
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.avgWeight && (
                          <p className='text-sm text-red-600 mt-1' role='alert'>
                            {fieldErrors.avgWeight}
                          </p>
                        )}
                        {(avgWeightNum ?? 0) > 0 && quantity > 0 && (
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
                          <span
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium'
                            aria-hidden
                          >
                            {L.currencySymbol}
                          </span>
                          <input
                            type='number'
                            placeholder='0.00'
                            step='0.01'
                            min='0'
                            value={pricePerUnit ?? ''}
                            onChange={(e) => {
                              setPricePerUnit(
                                e.target.value === '' ? null : e.target.value,
                              )
                              clearFieldError('pricePerUnit')
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.pricePerUnit
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.pricePerUnit && (
                          <p className='text-sm text-red-600 mt-1' role='alert'>
                            {fieldErrors.pricePerUnit}
                          </p>
                        )}
                        {(pricePerUnitNum ?? 0) > 0 && quantity > 0 && (
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
                      <AdditionalCostsSection
                        additionalCosts={additionalCosts}
                        fieldErrors={fieldErrors}
                        onAdd={handleAddAdditionalCost}
                        onRemove={handleRemoveAdditionalCost}
                        onChange={handleAdditionalCostChange}
                        clearFieldError={clearFieldError}
                      />
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
                          value={avgWeight ?? ''}
                          onChange={(e) => {
                            setAvgWeight(
                              e.target.value === '' ? null : e.target.value,
                            )
                            clearFieldError('avgWeight')
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                            fieldErrors.avgWeight
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {fieldErrors.avgWeight && (
                        <p className='text-sm text-red-600 mt-1' role='alert'>
                          {fieldErrors.avgWeight}
                        </p>
                      )}
                      {(avgWeightNum ?? 0) > 0 && quantity > 0 && (
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
                          <span
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium'
                            aria-hidden
                          >
                            {L.currencySymbol}
                          </span>
                          <input
                            type='number'
                            placeholder='0.00'
                            step='0.01'
                            min='0'
                            value={pricePerUnit ?? ''}
                            onChange={(e) => {
                              setPricePerUnit(
                                e.target.value === '' ? null : e.target.value,
                              )
                              clearFieldError('pricePerUnit')
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.pricePerUnit
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.pricePerUnit && (
                          <p className='text-sm text-red-600 mt-1' role='alert'>
                            {fieldErrors.pricePerUnit}
                          </p>
                        )}
                        {(pricePerUnitNum ?? 0) > 0 && quantity > 0 && (
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
                      <AdditionalCostsSection
                        additionalCosts={additionalCosts}
                        fieldErrors={fieldErrors}
                        onAdd={handleAddAdditionalCost}
                        onRemove={handleRemoveAdditionalCost}
                        onChange={handleAdditionalCostChange}
                        clearFieldError={clearFieldError}
                      />
                    </>
                  )}

                  {actionType === 'sell' && (
                    <>
                      {fieldErrors.sellGradeRows && (
                        <p className='text-sm text-red-600' role='alert'>
                          {fieldErrors.sellGradeRows}
                        </p>
                      )}
                      <div className='border-t border-gray-200 pt-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <label className='block text-sm font-medium text-gray-700'>
                            {L.speciesToSell}
                          </label>
                          {sellGradeRows.length > 0 && (
                            <button
                              type='button'
                              onClick={handleAddSellGradeRow}
                              disabled={
                                fishSizeGrades.length > 0 &&
                                sellGradeRows.length >= fishSizeGrades.length
                              }
                              className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              <Plus size={16} />
                              {L.addSizeRow}
                            </button>
                          )}
                        </div>
                        {sellGradeRows.length > 0 && (
                          <div className='border border-gray-200 rounded-xl overflow-hidden'>
                            <div className='grid grid-cols-[5.5rem_1fr_1fr_1fr_5.5rem_2rem] gap-x-2 pl-4 pr-3 py-2 bg-gray-100 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                              <div className='pl-3'>
                                ไซส์ <span className='text-red-400'>*</span>
                              </div>
                              <div className='pl-3'>
                                กก. <span className='text-red-400'>*</span>
                              </div>
                              <div className='pl-3'>
                                บาท/กก. <span className='text-red-400'>*</span>
                              </div>
                              <div className='pl-3'>ตัว</div>
                              <div className='text-right pr-3'>รวม</div>
                              <div />
                            </div>
                            <div className='divide-y divide-gray-100'>
                              {sellGradeRows.map((row) => {
                                const usedGradeIds = new Set(
                                  sellGradeRows
                                    .filter((r) => r.id !== row.id)
                                    .map((r) => r.gradeId),
                                )
                                const availableGrades = fishSizeGrades.filter(
                                  (g) =>
                                    g.key === row.gradeId ||
                                    !usedGradeIds.has(g.key),
                                )
                                const subtotal =
                                  (row.weight || 0) * (row.pricePerKg || 0)
                                return (
                                  <div
                                    key={row.id}
                                    className='grid grid-cols-[5.5rem_1fr_1fr_1fr_5.5rem_2rem] gap-x-2 px-3 py-2 items-center bg-white hover:bg-gray-50 transition-colors'
                                  >
                                    <div className='min-w-0'>
                                      <select
                                        value={row.gradeId || ''}
                                        onChange={(e) => {
                                          handleSellGradeRowChange(
                                            row.id,
                                            'gradeId',
                                            e.target.value,
                                          )
                                          clearFieldError(`sell_g_${row.id}`)
                                        }}
                                        className={`w-full h-9 px-2 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white ${
                                          fieldErrors[`sell_g_${row.id}`]
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        }`}
                                      >
                                        <option value='' disabled>
                                          —
                                        </option>
                                        {availableGrades.map((g) => (
                                          <option key={g.key} value={g.key}>
                                            {g.value}
                                          </option>
                                        ))}
                                      </select>
                                      {fieldErrors[`sell_g_${row.id}`] && (
                                        <p className='text-[10px] text-red-600 mt-0.5'>
                                          {fieldErrors[`sell_g_${row.id}`]}
                                        </p>
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <div className='relative'>
                                        <input
                                          type='number'
                                          placeholder='0.0'
                                          step='0.1'
                                          min='0'
                                          value={row.weight || ''}
                                          onChange={(e) => {
                                            handleSellGradeRowChange(
                                              row.id,
                                              'weight',
                                              e.target.value,
                                            )
                                            clearFieldError(`sell_w_${row.id}`)
                                          }}
                                          className={`w-full h-9 pl-3 pr-8 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white ${
                                            fieldErrors[`sell_w_${row.id}`]
                                              ? 'border-red-500'
                                              : 'border-gray-300'
                                          }`}
                                        />
                                        <span className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>
                                          {L.unitKg}
                                        </span>
                                      </div>
                                      {fieldErrors[`sell_w_${row.id}`] && (
                                        <p className='text-[10px] text-red-600 mt-0.5'>
                                          {fieldErrors[`sell_w_${row.id}`]}
                                        </p>
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <div className='relative'>
                                        <span className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>
                                          บาท
                                        </span>
                                        <input
                                          type='number'
                                          placeholder='0'
                                          step='1'
                                          min='0'
                                          value={row.pricePerKg || ''}
                                          onChange={(e) => {
                                            handleSellGradeRowChange(
                                              row.id,
                                              'pricePerKg',
                                              e.target.value,
                                            )
                                            clearFieldError(`sell_p_${row.id}`)
                                          }}
                                          className={`w-full h-9 pl-3 pr-9 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white ${
                                            fieldErrors[`sell_p_${row.id}`]
                                              ? 'border-red-500'
                                              : 'border-gray-300'
                                          }`}
                                        />
                                      </div>
                                      {fieldErrors[`sell_p_${row.id}`] && (
                                        <p className='text-[10px] text-red-600 mt-0.5'>
                                          {fieldErrors[`sell_p_${row.id}`]}
                                        </p>
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <input
                                        type='number'
                                        placeholder=''
                                        step='1'
                                        min='0'
                                        value={row.fishCount ?? ''}
                                        onChange={(e) =>
                                          handleSellGradeRowChange(
                                            row.id,
                                            'fishCount',
                                            e.target.value,
                                          )
                                        }
                                        className='w-full h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white text-center'
                                        title={L.fishCountOptional}
                                      />
                                    </div>
                                    <div className='text-right text-sm font-semibold text-gray-900 tabular-nums'>
                                      {subtotal > 0
                                        ? `${L.currencySymbol}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}`
                                        : `${L.currencySymbol}0`}
                                    </div>
                                    <button
                                      type='button'
                                      onClick={() =>
                                        handleRemoveSellGradeRow(row.id)
                                      }
                                      className='w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                                      title={L.removeRow}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {sellGradeRows.length === 0 && (
                          <div className='text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                            <Fish
                              size={40}
                              className='mx-auto text-gray-400 mb-2'
                            />
                            <p className='text-sm text-gray-500 mb-3'>
                              {L.noSpeciesAddedForSale}
                            </p>
                            <button
                              type='button'
                              onClick={handleAddSellGradeRow}
                              className='px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-300'
                            >
                              <Plus size={16} className='inline mr-1' />
                              {L.addSizeRow}
                            </button>
                          </div>
                        )}
                      </div>
                      {sellGradeRows.length > 0 &&
                        sellTotals.totalWeight > 0 && (
                          <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200'>
                            <p className='text-xs text-purple-700 font-medium mb-3'>
                              {L.saleSummary}
                            </p>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <p className='text-xs text-purple-700 font-medium mb-1'>
                                  {L.totalWeightLabel}
                                </p>
                                <p className='text-xl font-bold text-purple-900'>
                                  {sellTotals.totalWeight.toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 1 },
                                  )}{' '}
                                  {L.unitKg}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-purple-700 font-medium mb-1'>
                                  {L.totalRevenueLabel}
                                </p>
                                <p className='text-xl font-bold text-purple-900'>
                                  {L.currencySymbol}
                                  {sellTotals.totalRevenue.toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 1 },
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {L.buyerMarket}
                          <span className='text-red-500 ml-0.5' aria-hidden>
                            *
                          </span>
                        </label>
                        <select
                          value={buyer}
                          onChange={(e) => {
                            setBuyer(e.target.value)
                            clearFieldError('buyer')
                          }}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                            fieldErrors.buyer
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          required
                          aria-invalid={!!fieldErrors.buyer}
                          aria-describedby={
                            fieldErrors.buyer ? 'buyer-error' : undefined
                          }
                        >
                          <option value='' disabled>
                            {L.selectBuyerMarket}
                          </option>
                          {merchants.map((m) => (
                            <option key={m.id} value={String(m.id)}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.buyer && (
                          <p
                            id='buyer-error'
                            className='text-sm text-red-600 mt-1'
                            role='alert'
                          >
                            {fieldErrors.buyer}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {actionType === 'sell' && (
                    <AdditionalCostsSection
                      additionalCosts={additionalCosts}
                      fieldErrors={fieldErrors}
                      onAdd={handleAddAdditionalCost}
                      onRemove={handleRemoveAdditionalCost}
                      onChange={handleAdditionalCostChange}
                      clearFieldError={clearFieldError}
                      variant='purple'
                    />
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
                    <DatePicker
                      value={activityDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(date) => {
                        setActivityDate(date)
                        clearFieldError('activityDate')
                      }}
                      className={
                        fieldErrors.activityDate
                          ? 'border-red-500 ring-2 ring-red-200'
                          : ''
                      }
                      aria-invalid={!!fieldErrors.activityDate}
                      aria-describedby={
                        fieldErrors.activityDate
                          ? 'activityDate-error'
                          : undefined
                      }
                    />
                    {fieldErrors.activityDate && (
                      <p
                        id='activityDate-error'
                        className='text-sm text-red-600 mt-1'
                        role='alert'
                      >
                        {fieldErrors.activityDate}
                      </p>
                    )}
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
                              <p className='text-xs text-gray-600'>
                                {L.current}
                              </p>
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
                              <p className='text-xs text-gray-600'>
                                {L.afterAction}
                              </p>
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
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={L.notesPlaceholder}
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none'
                    />
                  </div>

                  {submitError && (
                    <div className='rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-700'>
                      {submitError}
                    </div>
                  )}

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
                        isSubmitting ||
                        !isFormValid ||
                        (actionType !== 'add' &&
                          quantity > pond.currentStock) ||
                        (actionType === 'sell' && sellGradeRows.length === 0)
                      }
                      className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${getButtonColor()} text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting && (
                        <Loader2
                          size={18}
                          className='animate-spin'
                          aria-hidden
                        />
                      )}
                      {getReviewButtonLabel()}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  )
}
