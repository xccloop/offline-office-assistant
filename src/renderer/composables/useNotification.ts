import { ElMessage, ElNotification } from 'element-plus'

/**
 * Global notification/toast composable.
 * Wraps Element Plus ElMessage and ElNotification for consistent usage across the app.
 */

/** Show a success toast message */
export function notifySuccess(message: string): void {
  ElMessage.success(message)
}

/** Show an error toast message */
export function notifyError(message: string): void {
  ElMessage.error(message)
}

/** Show a warning toast message */
export function notifyWarning(message: string): void {
  ElMessage.warning(message)
}

/** Show an info toast message */
export function notifyInfo(message: string): void {
  ElMessage.info(message)
}

/** Show a success notification (top-right, auto-close) */
export function notifySuccessDialog(title: string, message?: string): void {
  ElNotification.success({ title, message: message || '', duration: 3000 })
}

/** Show an error notification (top-right, stays longer) */
export function notifyErrorDialog(title: string, message?: string): void {
  ElNotification.error({ title, message: message || '', duration: 5000 })
}

/** Show a warning notification */
export function notifyWarningDialog(title: string, message?: string): void {
  ElNotification.warning({ title, message: message || '', duration: 4000 })
}

/** Show an info notification */
export function notifyInfoDialog(title: string, message?: string): void {
  ElNotification.info({ title, message: message || '', duration: 3000 })
}

/**
 * Default export for convenience: import useNotification from '...'
 */
export function useNotification() {
  return {
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
    successDialog: notifySuccessDialog,
    errorDialog: notifyErrorDialog,
    warningDialog: notifyWarningDialog,
    infoDialog: notifyInfoDialog,
  }
}
