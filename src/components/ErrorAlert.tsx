import Swal from 'sweetalert2'
import { ErrorResponse } from '../models/api/baseResponse'

const ErrorAlert = (err: ErrorResponse) => {
  Swal.fire({
    icon: 'error',
    title: err.code,
    text: err.message,
  })
}

export default ErrorAlert
