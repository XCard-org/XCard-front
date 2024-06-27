import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RootPaths } from '@/pages';
import { useNavigate } from 'react-router';
import styles from './SignIn.module.scss';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';

export function SignUp() {
  const navigate = useNavigate();

  const register = (values: React.FormEvent): void => {
    values.preventDefault();

    axios.post(
      `${SERVER_ADDRESS}/api/v1/user/`,
      {
        // @ts-expect-error exists
        full_name: values.target.full_name.value,
        // @ts-expect-error exists
        personal_email: values.target.personal_email.value,
        // @ts-expect-error exists
        username: values.target.personal_email.value,
        // @ts-expect-error exists
        personal_auth_secret: values.target.personal_auth_secret.value,
      },
      {
        headers: {
          Authorization: TOKEN(),
        },
      },
    );
  };

  return (
    <form className={styles.form} onSubmit={register}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" placeholder="Max Robinson" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="personal_email"
                type="personal_email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="personal_auth_secret">Password</Label>
              <Input id="personal_auth_secret" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <a
              href={RootPaths.signin}
              onClick={(e) => {
                e.preventDefault();
                navigate(RootPaths.signin);
              }}
              className="underline"
            >
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

