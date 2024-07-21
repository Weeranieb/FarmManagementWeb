import Swal from 'sweetalert2'
// import { ErrorResponse } from '../models/api/baseResponse'

const ErrorAlert = (err: any) => {
  console.log('Error Alert:', err)
  Swal.fire({
    icon: 'error',
    title: err.code || err.error?.code,
    text: err.message || err.error?.message,
  })
}

export default ErrorAlert
