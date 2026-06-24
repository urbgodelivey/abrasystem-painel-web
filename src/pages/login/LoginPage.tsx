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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-900 relative overflow-hidden">
      {/* Background Dog King — vermelho + amarelo */}
      <div className="absolute inset-0">
        <img
          src="/login-hero.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
        {/* Glow vermelho Dog King */}
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-brand-500 rounded-full filter blur-[220px] opacity-20" />
        {/* Glow amarelo Dog King */}
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-gold-500 rounded-full filter blur-[180px] opacity-25" />
        {/* Linhas de marca */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/40 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <img
              src="/logo.png"
              alt="Dog King"
              className="h-28 w-auto object-contain drop-shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            {/* Fallback do logo (escondido por padrão) */}
            <div className="hidden flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <span className="text-xl font-black text-white">DK</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wide">
                  <span className="text-brand-500">DOG</span>
                  <span className="text-gold-400"> KING</span>
                </h1>
              </div>
            </div>
            <p className="text-sm font-semibold text-brand-600 tracking-wide uppercase">
              🐶 O Melhor Delivery da Cidade
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Separador vermelho */}
          <div className="h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
                className={`bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-brand-500/20 focus-visible:border-brand-500/40 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                  className={`bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-brand-500/20 focus-visible:border-brand-500/40 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
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
                className="border-zinc-300 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-zinc-600">
                Lembrar acesso
              </Label>
            </div>

            {/* Botão Login */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-bold bg-gradient-to-r from-brand-700 via-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all duration-300 tracking-wide"
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
          <p className="text-[10px] text-zinc-400">v1.0.0</p>
        </div>
      </Card>
    </div>
  );
}
