/**
 * Thai locale for Admin Master Data page and EditMasterDataModal when used from it.
 */
export const adminMasterDataTh = {
  // Page header
  pageTitle: 'จัดการข้อมูลหลัก',
  pageSubtitle: 'เฉพาะผู้ดูแลระบบ',

  // Client selector (Farms/Ponds tabs)
  selectClient: 'เลือกลูกค้า',
  loadingClients: 'กำลังโหลดรายชื่อลูกค้า...',
  farmsCount: 'ฟาร์ม',
  pondsCount: 'บ่อ',

  // Create New tabs
  createNew: 'สร้างใหม่',
  tabClient: 'ลูกค้า',
  tabFarm: 'ฟาร์ม',
  tabPond: 'บ่อ',

  // Client form
  clientName: 'ชื่อลูกค้า',
  contactPerson: 'ผู้ติดต่อ',
  phone: 'เบอร์โทรศัพท์',
  email: 'อีเมล',
  required: '*',
  placeholderClientName: 'เช่น บริษัท อควา มารีน จำกัด',
  placeholderContactPerson: 'เช่น สมชาย ใจดี',
  placeholderPhone: 'เช่น 081-234-5678',
  placeholderEmail: 'เช่น contact@example.com',
  createClient: 'สร้างลูกค้า',
  reset: 'ล้าง',

  // Farm form
  pleaseSelectClientFirst: 'กรุณาเลือกลูกค้าก่อน',
  farmName: 'ชื่อฟาร์ม',
  placeholderFarmName: 'เช่น ฟาร์มรุ่งอรุณ',
  createFarm: 'สร้างฟาร์ม',

  // Pond form
  selectFarm: 'เลือกฟาร์ม',
  loading: 'กำลังโหลด...',
  noFarmsYet: 'ยังไม่มีฟาร์ม สร้างได้ในแท็บฟาร์ม',
  selectFarmOption: '-- เลือกฟาร์ม --',
  pond: 'บ่อ',
  pondName: 'ชื่อบ่อ',
  placeholderPondName: 'เช่น บ่อ D1',
  remove: 'ลบ',
  addAnotherPond: 'เพิ่มบ่ออีก',
  createPonds: 'สร้าง',

  // Existing Data panel
  allClients: 'ลูกค้าทั้งหมด',
  existingData: 'ข้อมูลที่มีอยู่',
  noClientsFound: 'ยังไม่มีลูกค้า สร้างได้ทางซ้าย →',
  selectClientToViewData: 'เลือกลูกค้าเพื่อดูข้อมูล',
  noFarmsFound: 'ยังไม่มีฟาร์ม สร้างได้ทางซ้าย →',
  loadingPonds: 'กำลังโหลดบ่อ...',
  noPondsYet: 'ยังไม่มีบ่อ',

  // Status (display only; API values stay active/maintenance)
  statusActive: 'ใช้งาน',
  statusMaintenance: 'ซ่อมบำรุง',

  // Actions
  editClientName: 'แก้ไขชื่อลูกค้า',
  editFarmName: 'แก้ไขชื่อฟาร์ม',
  editPondName: 'แก้ไขชื่อบ่อ',

  // Edit modal (used when opened from this page)
  editClientTitle: 'แก้ไขชื่อลูกค้า',
  editFarmTitle: 'แก้ไขชื่อฟาร์ม',
  editPondTitle: 'แก้ไขชื่อบ่อ',
  modalLabelName: 'ชื่อ',
  modalPlaceholderName: 'กรอกชื่อ',
  modalErrorNameRequired: 'กรุณากรอกชื่อ',
  modalSave: 'บันทึก',
  modalCancel: 'ยกเลิก',
  modalClose: 'ปิด',

  // Success messages
  successClientCreated: (name: string) => `สร้างลูกค้า "${name}" สำเร็จ`,
  successFarmCreated: (name: string, clientName: string) =>
    `สร้างฟาร์ม "${name}" สำหรับ ${clientName} สำเร็จ`,
  successPondsCreated: (count: number, farmName: string) =>
    count > 1
      ? `สร้าง ${count} บ่อ ใน ${farmName} สำเร็จ`
      : `สร้างบ่อใน ${farmName} สำเร็จ`,
  successUpdated: (type: string, name: string) =>
    `อัปเดต${type} "${name}" สำเร็จ`,

  // Validation / error alerts
  alertFillRequired: 'กรุณากรอกข้อมูลให้ครบ',
  alertSelectFarm: 'กรุณาเลือกฟาร์ม',
  alertAtLeastOnePondName: 'กรุณากรอกชื่อบ่ออย่างน้อย 1 บ่อ',
  alertCreateClientFailed: 'สร้างลูกค้าไม่สำเร็จ',
  alertCreateFarmFailed: 'สร้างฟาร์มไม่สำเร็จ',
  alertCreatePondsFailed: 'สร้างบ่อไม่สำเร็จ',
  alertUpdateFailed: 'อัปเดตไม่สำเร็จ',
} as const

export type AdminMasterDataLocale = typeof adminMasterDataTh
