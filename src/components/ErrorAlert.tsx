import Swal from 'sweetalert2'
import { ErrorResponse } from '../models/api/baseResponse'

const ErrorAlert = (err: ErrorResponse) => {
  console.log('Error Alert:', err)
  Swal.fire({
    icon: 'error',
    title: err.code,
    text: err.message,
  })
}

export default ErrorAlert
