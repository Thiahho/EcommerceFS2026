'use client';

import Script from 'next/script';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../hooks/useCart';

type MercadoPagoInstance = {
  fields: {
    create: (field: string, options: { placeholder: string }) => {
      mount: (elementId: string) => {
        on: (event: string, handler: (data: { bin: string }) => void) => void;
        update: (config: { settings: unknown }) => void;
      };
    };
    createCardToken: (payload: {
      cardholderName: string;
      identificationType: string;
      identificationNumber: string;
    }) => Promise<{ id: string }>;
  };
  getIdentificationTypes: () => Promise<Array<{ id: string; name: string }>>;
  getPaymentMethods: (payload: { bin: string }) => Promise<{ results: Array<any> }>;
  getIssuers: (payload: { paymentMethodId: string; bin: string }) => Promise<Array<any>>;
  getInstallments: (payload: {
    amount: string;
    bin: string;
    paymentTypeId: string;
  }) => Promise<Array<{ payer_costs: Array<any> }>>;
};

type MpWindow = Window & {
  MercadoPago?: new (key: string, options: { locale: string }) => MercadoPagoInstance;
};

export default function PaymentForm() {
  const { items, total } = useCart();
  const [mpReady, setMpReady] = useState(false);
  const mpRef = useRef<MercadoPagoInstance | null>(null);
  const cardNumberRef = useRef<ReturnType<MercadoPagoInstance['fields']['create']> | null>(null);
  const expirationRef = useRef<ReturnType<MercadoPagoInstance['fields']['create']> | null>(null);
  const securityCodeRef = useRef<ReturnType<MercadoPagoInstance['fields']['create']> | null>(null);
  const [message, setMessage] = useState('');

  const transactionAmount = useMemo(() => total.toFixed(2), [total]);

  useEffect(() => {
    if (!mpReady) {
      return;
    }

    const mp = mpRef.current;
    if (!mp) {
      return;
    }

    const cardNumberElement = mp.fields.create('cardNumber', {
      placeholder: 'Número de la tarjeta'
    }).mount('form-checkout__cardNumber');

    const expirationDateElement = mp.fields.create('expirationDate', {
      placeholder: 'MM/YY'
    }).mount('form-checkout__expirationDate');

    const securityCodeElement = mp.fields.create('securityCode', {
      placeholder: 'Código de seguridad'
    }).mount('form-checkout__securityCode');

    cardNumberRef.current = cardNumberElement;
    expirationRef.current = expirationDateElement;
    securityCodeRef.current = securityCodeElement;

    const paymentMethodElement = document.getElementById('paymentMethodId') as HTMLInputElement;
    const issuerElement = document.getElementById('form-checkout__issuer') as HTMLSelectElement;
    const installmentsElement = document.getElementById('form-checkout__installments') as HTMLSelectElement;

    const issuerPlaceholder = 'Banco emisor';
    const installmentsPlaceholder = 'Cuotas';

    let currentBin = '';

    cardNumberElement.on('binChange', async ({ bin }) => {
      try {
        if (!bin && paymentMethodElement.value) {
          clearSelectsAndSetPlaceholders();
          paymentMethodElement.value = '';
        }

        if (bin && bin !== currentBin) {
          const { results } = await mp.getPaymentMethods({ bin });
          const paymentMethod = results[0];

          paymentMethodElement.value = paymentMethod.id;
          updatePCIFieldsSettings(paymentMethod);
          await updateIssuer(paymentMethod, bin);
          await updateInstallments(bin);
        }

        currentBin = bin;
      } catch (error) {
        console.error('error getting payment methods: ', error);
      }
    });

    async function updateIssuer(paymentMethod: any, bin: string) {
      const { additional_info_needed, issuer } = paymentMethod;
      let issuerOptions = [issuer];

      if (additional_info_needed.includes('issuer_id')) {
        issuerOptions = await mp.getIssuers({ paymentMethodId: paymentMethod.id, bin });
      }

      createSelectOptions(issuerElement, issuerOptions, { label: 'name', value: 'id' });
    }

    async function updateInstallments(bin: string) {
      try {
        const installments = await mp.getInstallments({
          amount: transactionAmount,
          bin,
          paymentTypeId: 'credit_card'
        });
        const installmentOptions = installments[0].payer_costs;
        createSelectOptions(installmentsElement, installmentOptions, {
          label: 'recommended_message',
          value: 'installments'
        });
      } catch (error) {
        console.error('error getting installments: ', error);
      }
    }

    function clearSelectsAndSetPlaceholders() {
      clearHTMLSelectChildrenFrom(issuerElement);
      createSelectElementPlaceholder(issuerElement, issuerPlaceholder);

      clearHTMLSelectChildrenFrom(installmentsElement);
      createSelectElementPlaceholder(installmentsElement, installmentsPlaceholder);
    }

    function clearHTMLSelectChildrenFrom(element: HTMLSelectElement) {
      const currOptions = [...element.children];
      currOptions.forEach((child) => child.remove());
    }

    function createSelectElementPlaceholder(element: HTMLSelectElement, placeholder: string) {
      const optionElement = document.createElement('option');
      optionElement.textContent = placeholder;
      optionElement.setAttribute('selected', '');
      optionElement.setAttribute('disabled', '');

      element.appendChild(optionElement);
    }

    function updatePCIFieldsSettings(paymentMethod: any) {
      const { settings } = paymentMethod;

      const cardNumberSettings = settings[0].card_number;
      cardNumberElement.update({
        settings: cardNumberSettings
      });

      const securityCodeSettings = settings[0].security_code;
      securityCodeElement.update({
        settings: securityCodeSettings
      });
    }

    (async function getIdentificationTypes() {
      try {
        const identificationTypes = await mp.getIdentificationTypes();
        const identificationTypeElement = document.getElementById(
          'form-checkout__identificationType'
        ) as HTMLSelectElement;

        createSelectOptions(identificationTypeElement, identificationTypes, { label: 'name', value: 'id' });
      } catch (error) {
        console.error('Error getting identificationTypes: ', error);
      }
    })();

    function createSelectOptions(
      element: HTMLSelectElement,
      options: Array<Record<string, string>>,
      labelsAndKeys: { label: string; value: string }
    ) {
      const { label, value } = labelsAndKeys;

      element.options.length = 0;

      const tempOptions = document.createDocumentFragment();

      options.forEach((option) => {
        const optValue = option[value];
        const optLabel = option[label];

        const opt = document.createElement('option');
        opt.value = optValue;
        opt.textContent = optLabel;

        tempOptions.appendChild(opt);
      });

      element.appendChild(tempOptions);
    }
  }, [mpReady, transactionAmount]);

  if (!items.length) {
    return (
      <div className="card">
        <p>Tu carrito está vacío. Volvé al catálogo para continuar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          const MpConstructor = (window as MpWindow).MercadoPago;
          const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
          if (!MpConstructor || !publicKey) {
            setMessage('Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY.');
            return;
          }
          mpRef.current = new MpConstructor(publicKey, { locale: 'es-AR' });
          setMpReady(true);
        }}
      />

      {message && <div className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{message}</div>}

      <form
        id="form-checkout"
        className="card space-y-6"
        action="/process_payment"
        method="POST"
        onSubmit={async (event) => {
          try {
            const tokenElement = document.getElementById('token') as HTMLInputElement;
            if (!tokenElement.value && mpRef.current) {
              event.preventDefault();
              const token = await mpRef.current.fields.createCardToken({
                cardholderName: (document.getElementById('form-checkout__cardholderName') as HTMLInputElement)
                  .value,
                identificationType: (
                  document.getElementById('form-checkout__identificationType') as HTMLSelectElement
                ).value,
                identificationNumber: (
                  document.getElementById('form-checkout__identificationNumber') as HTMLInputElement
                ).value
              });
              tokenElement.value = token.id;
              (event.currentTarget as HTMLFormElement).requestSubmit();
            }
          } catch (error) {
            console.error('error creating card token: ', error);
          }
        }}
      >
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Datos del comprador</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              required
              name="fullName"
              placeholder="Nombre y apellido"
              className="rounded-2xl border border-cloud px-4 py-2"
            />
            <input type="text" required name="dni" placeholder="DNI" className="rounded-2xl border border-cloud px-4 py-2" />
            <input
              type="text"
              required
              name="phone"
              placeholder="Teléfono"
              className="rounded-2xl border border-cloud px-4 py-2"
            />
            <input
              type="email"
              required
              id="form-checkout__email"
              name="email"
              placeholder="Email"
              className="rounded-2xl border border-cloud px-4 py-2"
            />
            <input
              type="text"
              required
              name="address"
              placeholder="Dirección"
              className="rounded-2xl border border-cloud px-4 py-2"
            />
            <input
              type="text"
              required
              name="city"
              placeholder="Localidad"
              className="rounded-2xl border border-cloud px-4 py-2"
            />
            <input
              type="text"
              required
              name="postalCode"
              placeholder="Código postal"
              className="rounded-2xl border border-cloud px-4 py-2"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Datos de pago</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div id="form-checkout__cardNumber" className="container rounded-2xl border border-cloud px-3 py-2" />
            <div id="form-checkout__expirationDate" className="container rounded-2xl border border-cloud px-3 py-2" />
            <div id="form-checkout__securityCode" className="container rounded-2xl border border-cloud px-3 py-2" />
            <input
              type="text"
              id="form-checkout__cardholderName"
              placeholder="Titular de la tarjeta"
              className="rounded-2xl border border-cloud px-4 py-2"
              required
            />
            <select
              id="form-checkout__issuer"
              name="issuer"
              className="rounded-2xl border border-cloud px-4 py-2"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Banco emisor
              </option>
            </select>
            <select
              id="form-checkout__installments"
              name="installments"
              className="rounded-2xl border border-cloud px-4 py-2"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Cuotas
              </option>
            </select>
            <select
              id="form-checkout__identificationType"
              name="identificationType"
              className="rounded-2xl border border-cloud px-4 py-2"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Tipo de documento
              </option>
            </select>
            <input
              type="text"
              id="form-checkout__identificationNumber"
              name="identificationNumber"
              placeholder="Número de documento"
              className="rounded-2xl border border-cloud px-4 py-2"
              required
            />
          </div>
        </section>

        <input id="token" name="token" type="hidden" />
        <input id="paymentMethodId" name="paymentMethodId" type="hidden" />
        <input id="transactionAmount" name="transactionAmount" type="hidden" value={transactionAmount} />
        <input id="description" name="description" type="hidden" value="Compra EcommerceFS2026" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-ink">${total.toLocaleString('es-AR')}</p>
          </div>
          <button type="submit" id="form-checkout__submit" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
            Pagar
          </button>
        </div>
      </form>
    </div>
  );
}
