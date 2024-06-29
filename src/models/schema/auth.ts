import { User } from './user'

export interface AuthorizeResult {
  accessToken: string
  expiredAt: string
  user: User
}
