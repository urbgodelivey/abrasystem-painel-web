import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/use-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);

      if (result.error) {
        toast({
          title: 'Erro no login',
          description: result.error.message,
          variant: 'destructive',
        });
        return;
      }

      if (result.data) {
        setAuth(result.data);
        toast({ title: 'Bem-vindo!', description: `Olá, ${result.data.user.name}` });
        navigate('/dashboard');
      }
    } catch {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor. Verifique a configuração do banco.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
      {/* Background decorativo dourado com imagem hero */}
      <div className="absolute inset-0">
        <img
          src="/login-hero.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold-600 rounded-full filter blur-[180px] opacity-15" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gold-500 rounded-full filter blur-[200px] opacity-10" />
        {/* Linhas douradas decorativas */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      <Card className="w-full max-w-md mx-4 bg-black/60 backdrop-blur-2xl border-gold-500/20 shadow-2xl shadow-gold-500/5 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <img
              src="/logo.png"
              alt="AbraSystem"
              className="h-24 w-auto object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback se logo não existir
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            {/* Fallback do logo (escondido por padrão) */}
            <div className="hidden flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg shadow-gold-500/30">
                <span className="text-3xl font-black text-black">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-white">ABRA</span>
                  <span className="text-gold-500">SYSTEM</span>
                </h1>
              </div>
            </div>
            <p className="text-sm text-gold-500/60">
              Soluções Inteligentes em Sistemas
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Separador dourado */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gold-400/80">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
                className={`bg-white/5 border-gold-500/20 text-white placeholder:text-white/30 focus-visible:ring-gold-500/50 focus-visible:border-gold-500/40 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gold-400/80">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                  className={`bg-white/5 border-gold-500/20 text-white placeholder:text-white/30 focus-visible:ring-gold-500/50 focus-visible:border-gold-500/40 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500/40 hover:text-gold-500/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Lembrar acesso */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={watch('remember')}
                onCheckedChange={(checked) => setValue('remember', Boolean(checked))}
                className="border-gold-500/30 data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-white/60">
                Lembrar acesso
              </Label>
            </div>

            {/* Botão Login */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:via-gold-400 hover:to-gold-300 text-black shadow-lg shadow-gold-500/25 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>

        {/* Versão */}
        <div className="text-center pb-6">
          <p className="text-[10px] text-gold-700/40">v1.0.0</p>
        </div>
      </Card>
    </div>
  );
}
