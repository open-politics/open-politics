import type { CancelablePromise } from '../client/core/CancelablePromise';
import { LoginService, UsersService } from '../client/services';
import type { Body_login_login_access_token, NewPassword } from '../client/models';

const getAccessToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
};

export const loginAccessToken = async ({ formData }: { formData: Body_login_login_access_token }): CancelablePromise<Token> => {
  try {
    const response = await LoginService.loginAccessToken({ formData });
    console.log('Login access token response:', response);
    return response;
  } catch (error) {
    console.error('Error in loginAccessToken:', error);
    throw error;
  }
};

export const getCurrentUser = async (): CancelablePromise<UserOut> => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await UsersService.usersReadUserMe();

    console.log('Current user response:', response);
    return response;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    throw error;
  }
};

export const recoverPassword = async (email: string): CancelablePromise<Message> => {
  try {
    const response = await LoginService.loginRecoverPassword({ email });
    console.log('Recover password response:', response);
    return response;
  } catch (error) {
    console.error('Error in recoverPassword:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): CancelablePromise<Message> => {
  try {
    const requestBody: NewPassword = { token, new_password: newPassword };
    const response = await LoginService.loginResetPassword({ requestBody });
    console.log('Reset password response:', response);
    return response;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
};
