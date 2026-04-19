import initTranslations from '@/app/i18n';
import TranslationsProvider from '@/components/providers/TranslationsProvider';
import Header from "@/components/shared/header";
import Image from "next/image";
import Footer from '@/components/shared/footer';
import AnimatedNumber from '@/components/ui/basic-number';
import { ConfigSite } from '@/lib/conf';

const stats = [
  { label: 'listings', value: 12000, suffix: '+' },
  { label: 'users', value: 45000, suffix: '+' },
  { label: 'cities', value: 48, suffix: '' },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ['common', 'about']);

  return (
    <TranslationsProvider locale={locale} namespaces={['common', 'about']} resources={resources}>
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <Header page="home" />

        <main className="isolate">
          {/* Hero section */}
          <div className="relative isolate -z-10 overflow-hidden bg-linear-to-b from-blue-100/20 pt-14">
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
                  {t('about:title', {siteName: ConfigSite.siteName})}
                </h1>
                <p className="mt-6 text-lg leading-8 text-zinc-600">
                  {t('about:mission.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="mx-auto flex max-w-xs flex-col gap-y-4">
                  {/* @ts-ignore */}
                  <dt className="text-base leading-7 text-zinc-600">{t(`about:stats.${stat.label}`)}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl justify-center">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Image section */}
          <div className="mt-20 sm:mt-24 xl:mx-auto xl:max-w-7xl xl:px-8">
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"
              alt=""
              width={2832}
              height={1416}
              className="aspect-5/2 w-full object-cover xl:rounded-3xl"
            />
          </div>

          {/* Team section */}
          <div className="mx-auto mt-20 max-w-7xl px-6 sm:mt-24 lg:px-8 mb-24">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{t('about:team.title')}</h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600">
                {t('about:team.description')}
              </p>
            </div>
            <ul role="list" className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((member) => (
                <li key={member}>
                  <Image
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                    src={`https://images.unsplash.com/photo-${member === 1 ? '1519244703995-f4e0f30006d5' : member === 2 ? '1506794778202-cad84cf45f1d' : '1517841905240-472988babdf9'}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                    alt=""
                    width={96}
                    height={96}
                  />
                  <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-zinc-900">Member {member}</h3>
                  <p className="text-sm leading-6 text-zinc-600">Role {member}</p>
                </li>
              ))}
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    </TranslationsProvider>
  );
}
