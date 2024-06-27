import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import styles from './SignIn.module.scss';
import axios from 'axios';
import { SERVER_ADDRESS } from '@/constants';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';

export function SignIn() {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const login = (): void => {
    const form_data = new FormData();
    form_data.append('username', loginValue);
    form_data.append('password', password);

    axios
      .post(`${SERVER_ADDRESS}/api/v1/login/access-token`, form_data)
      .then((res) => {
        localStorage.setItem('userToken', res.data.access_token);
        navigate(RootPaths.categories);
      })
      .catch(() => {
        return toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User not found!',
        });
      });
  };

  return (
    <div className={styles.form}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => setLoginValue(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" onClick={() => login()}>
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a
              href={RootPaths.signin}
              onClick={(e) => {
                e.preventDefault();
                navigate(RootPaths.signup);
              }}
              className="underline"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

