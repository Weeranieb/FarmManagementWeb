import Swal from 'sweetalert2'

const SuccessAlert = (title: string = 'Successfully') => {
  Swal.fire({
    icon: 'success',
    title: title,
    showConfirmButton: false,
    timer: 1500,
  })
}

export default SuccessAlert
