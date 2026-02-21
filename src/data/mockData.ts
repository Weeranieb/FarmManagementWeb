// Mock data for BoonmaFarm

export interface Client {
  id: string
  name: string
  status: 'active' | 'inactive'
}

export interface Farm {
  id: string
  code: string
  name: string
  clientId: string
  location: string
  area: number
  pondCount: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Pond {
  id: string
  code: string
  name: string
  farmId: string
  farmName: string
  area: number
  depth: number
  status: 'active' | 'inactive' | 'maintenance'
  currentStock: number
  createdAt: string
  species?: string[]
  ageInDays?: number
  lastActivityDate?: string
  lastActivityType?: string
}

export interface Worker {
  id: string
  firstName: string
  lastName: string
  contact: string
  nationality: string
  salary: number
  hireDate: string
  farmGroupId: string
  status: 'active' | 'inactive'
}

export interface Merchant {
  id: string
  code: string
  name: string
  contact: string
  location: string
  type: 'supplier' | 'vendor'
  createdAt: string
}

export interface FeedCollection {
  id: string
  code: string
  name: string
  unit: string
  latestPrice: number
  priceHistory: PriceHistory[]
}

export interface PriceHistory {
  date: string
  price: number
}

// Mock Clients
export const mockClients: Client[] = [
  { id: '1', name: 'Boonma Farm Co.', status: 'active' },
  { id: '2', name: 'River Delta Group', status: 'active' },
  { id: '3', name: 'Coastal Aqua Ltd.', status: 'active' },
]

// Mock Farms
export const mockFarms: Farm[] = [
  {
    id: '1',
    code: 'FM001',
    name: 'North Valley Farm',
    clientId: '1',
    location: 'Chiang Mai',
    area: 50,
    pondCount: 12,
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    code: 'FM002',
    name: 'River Delta Farm',
    clientId: '1',
    location: 'Bangkok',
    area: 75,
    pondCount: 18,
    status: 'active',
    createdAt: '2023-03-20',
  },
  {
    id: '3',
    code: 'FM003',
    name: 'Coastal Aqua Farm',
    clientId: '2',
    location: 'Phuket',
    area: 40,
    pondCount: 10,
    status: 'active',
    createdAt: '2023-05-10',
  },
  {
    id: '4',
    code: 'FM004',
    name: 'Mountain Spring Farm',
    clientId: '2',
    location: 'Chiang Rai',
    area: 30,
    pondCount: 8,
    status: 'inactive',
    createdAt: '2023-07-22',
  },
  {
    id: '5',
    code: 'FM005',
    name: 'Lake View Farm',
    clientId: '3',
    location: 'Nakhon Sawan',
    area: 60,
    pondCount: 15,
    status: 'active',
    createdAt: '2023-09-05',
  },
]

// Mock Ponds
export const mockPonds: Pond[] = [
  {
    id: '1',
    code: 'PD001',
    name: 'Pond A1',
    farmId: '1',
    farmName: 'North Valley Farm',
    area: 4.5,
    depth: 2.0,
    status: 'active',
    currentStock: 5000,
    createdAt: '2023-02-01',
    species: ['Catfish', 'Tilapia'],
    ageInDays: 120,
    lastActivityDate: '2024-12-15',
    lastActivityType: 'feed_distribution',
  },
  {
    id: '2',
    code: 'PD002',
    name: 'Pond A2',
    farmId: '1',
    farmName: 'North Valley Farm',
    area: 4.0,
    depth: 1.8,
    status: 'active',
    currentStock: 4500,
    createdAt: '2023-02-01',
    species: ['Catfish'],
    ageInDays: 115,
    lastActivityDate: '2024-12-14',
    lastActivityType: 'stock_add',
  },
  {
    id: '3',
    code: 'PD003',
    name: 'Pond B1',
    farmId: '2',
    farmName: 'River Delta Farm',
    area: 5.0,
    depth: 2.2,
    status: 'active',
    currentStock: 6000,
    createdAt: '2023-04-10',
  },
  {
    id: '4',
    code: 'PD004',
    name: 'Pond B2',
    farmId: '2',
    farmName: 'River Delta Farm',
    area: 4.8,
    depth: 2.0,
    status: 'maintenance',
    currentStock: 0,
    createdAt: '2023-04-10',
  },
  {
    id: '5',
    code: 'PD005',
    name: 'Pond C1',
    farmId: '3',
    farmName: 'Coastal Aqua Farm',
    area: 3.5,
    depth: 1.5,
    status: 'active',
    currentStock: 3500,
    createdAt: '2023-06-01',
  },
  {
    id: '6',
    code: 'PD006',
    name: 'Pond C2',
    farmId: '3',
    farmName: 'Coastal Aqua Farm',
    area: 3.8,
    depth: 1.6,
    status: 'active',
    currentStock: 3800,
    createdAt: '2023-06-01',
  },
]

// Mock Workers
export const mockWorkers: Worker[] = [
  {
    id: '1',
    firstName: 'Somchai',
    lastName: 'Thanarak',
    contact: '+66 81 234 5678',
    nationality: 'Thai',
    salary: 15000,
    hireDate: '2022-01-15',
    farmGroupId: 'FG001',
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Niran',
    lastName: 'Phongsa',
    contact: '+66 82 345 6789',
    nationality: 'Thai',
    salary: 18000,
    hireDate: '2022-03-20',
    farmGroupId: 'FG001',
    status: 'active',
  },
  {
    id: '3',
    firstName: 'Aung',
    lastName: 'Win',
    contact: '+95 9 123 4567',
    nationality: 'Myanmar',
    salary: 12000,
    hireDate: '2022-05-10',
    farmGroupId: 'FG002',
    status: 'active',
  },
  {
    id: '4',
    firstName: 'Bounmy',
    lastName: 'Khampheng',
    contact: '+856 20 567 8901',
    nationality: 'Lao',
    salary: 13000,
    hireDate: '2022-07-22',
    farmGroupId: 'FG002',
    status: 'active',
  },
  {
    id: '5',
    firstName: 'Preecha',
    lastName: 'Wongsakul',
    contact: '+66 83 456 7890',
    nationality: 'Thai',
    salary: 20000,
    hireDate: '2021-09-05',
    farmGroupId: 'FG003',
    status: 'active',
  },
  {
    id: '6',
    firstName: 'Manit',
    lastName: 'Sukhum',
    contact: '+66 84 567 8901',
    nationality: 'Thai',
    salary: 16000,
    hireDate: '2022-11-12',
    farmGroupId: 'FG003',
    status: 'inactive',
  },
]

// Mock Merchants
export const mockMerchants: Merchant[] = [
  {
    id: '1',
    code: 'MC001',
    name: 'Thai Aqua Supply',
    contact: '+66 2 123 4567',
    location: 'Bangkok',
    type: 'supplier',
    createdAt: '2020-01-10',
  },
  {
    id: '2',
    code: 'MC002',
    name: 'Ocean Feed Co.',
    contact: '+66 2 234 5678',
    location: 'Bangkok',
    type: 'supplier',
    createdAt: '2020-03-15',
  },
  {
    id: '3',
    code: 'MC003',
    name: 'Fresh Fish Market',
    contact: '+66 2 345 6789',
    location: 'Samut Prakan',
    type: 'vendor',
    createdAt: '2020-05-20',
  },
  {
    id: '4',
    code: 'MC004',
    name: 'Aqua Equipment Ltd.',
    contact: '+66 2 456 7890',
    location: 'Bangkok',
    type: 'supplier',
    createdAt: '2020-07-25',
  },
  {
    id: '5',
    code: 'MC005',
    name: 'Coastal Traders',
    contact: '+66 76 567 8901',
    location: 'Phuket',
    type: 'vendor',
    createdAt: '2020-09-30',
  },
]

// Mock Feed Collections
export const mockFeedCollections: FeedCollection[] = [
  {
    id: '1',
    code: 'FD001',
    name: 'Premium Fish Pellets',
    unit: 'kg',
    latestPrice: 45.5,
    priceHistory: [
      { date: '2025-01-01', price: 45.5 },
      { date: '2024-12-01', price: 44.0 },
      { date: '2024-11-01', price: 43.5 },
      { date: '2024-10-01', price: 42.0 },
      { date: '2024-09-01', price: 41.5 },
      { date: '2024-08-01', price: 40.0 },
    ],
  },
  {
    id: '2',
    code: 'FD002',
    name: 'Standard Fish Feed',
    unit: 'kg',
    latestPrice: 32.0,
    priceHistory: [
      { date: '2025-01-01', price: 32.0 },
      { date: '2024-12-01', price: 31.5 },
      { date: '2024-11-01', price: 31.0 },
      { date: '2024-10-01', price: 30.5 },
      { date: '2024-09-01', price: 30.0 },
      { date: '2024-08-01', price: 29.5 },
    ],
  },
  {
    id: '3',
    code: 'FD003',
    name: 'Shrimp Feed Mix',
    unit: 'kg',
    latestPrice: 55.0,
    priceHistory: [
      { date: '2025-01-01', price: 55.0 },
      { date: '2024-12-01', price: 53.0 },
      { date: '2024-11-01', price: 52.5 },
      { date: '2024-10-01', price: 51.0 },
      { date: '2024-09-01', price: 50.0 },
      { date: '2024-08-01', price: 49.5 },
    ],
  },
  {
    id: '4',
    code: 'FD004',
    name: 'Organic Fish Feed',
    unit: 'kg',
    latestPrice: 68.0,
    priceHistory: [
      { date: '2025-01-01', price: 68.0 },
      { date: '2024-12-01', price: 67.0 },
      { date: '2024-11-01', price: 66.0 },
      { date: '2024-10-01', price: 65.0 },
      { date: '2024-09-01', price: 64.0 },
      { date: '2024-08-01', price: 63.0 },
    ],
  },
]
