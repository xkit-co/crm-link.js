const hasOwnProperty = <
  X extends Record<string, unknown>,
  Y extends PropertyKey
>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> => {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

const INTERNAL_ERROR = 'We encountered an unexpected error during installation'

const FRIENDLY_ERRORS = Object.freeze({
  // See: https://tools.ietf.org/html/rfc6749#section-4.1.2.1
  access_denied: 'Cancelled authorization',
  temporarily_unavailable:
    'Server is temporarily overloaded, please try again in a moment',
  invalid_request: INTERNAL_ERROR,
  unauthorized_client: INTERNAL_ERROR,
  unsupported_response_type: INTERNAL_ERROR,
  invalid_scope: INTERNAL_ERROR,
  server_error: INTERNAL_ERROR
})

const isErrorKey = (msg: string): msg is keyof typeof FRIENDLY_ERRORS => {
  return hasOwnProperty(FRIENDLY_ERRORS, msg)
}

export const friendlyMessage = (internalMessage: string): string => {
  if (isErrorKey(internalMessage)) {
    return FRIENDLY_ERRORS[internalMessage]
  }
  return internalMessage
}
