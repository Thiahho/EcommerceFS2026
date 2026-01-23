"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { createPreference, createOrder, processPayment } from "../lib/api";

// --- TIPADOS ---
type MercadoPagoInstance = {
  fields: {
    create: (field: string, options: { placeholder: string }) => any;
    createCardToken: (payload: any) => Promise<{ id: string }>;
  };
  getIdentificationTypes: () => Promise<Array<{ id: string; name: string }>>;
  getPaymentMethods: (payload: {
    bin: string;
  }) => Promise<{ results: Array<any> }>;
  getIssuers: (payload: {
    paymentMethodId: string;
    bin: string;
  }) => Promise<Array<any>>;
  getInstallments: (payload: {
    amount: string;
    bin: string;
    paymentTypeId: string;
  }) => Promise<Array<{ payer_costs: Array<any> }>>;
  bricks: () => {
    create: (
      brick: string,
      containerId: string,
      settings: any,
    ) => Promise<void>;
  };
};

type MpWindow = Window & {
  MercadoPago?: new (
    key: string,
    options: { locale: string },
  ) => MercadoPagoInstance;
};

export default function PaymentForm() {
  const router = useRouter();
  const { items, total, clear: clearCart } = useCart();
  const [mpReady, setMpReady] = useState(false);
  const [message, setMessage] = useState("");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mpRef = useRef<MercadoPagoInstance | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const mountedFields = useRef(false); // Para evitar doble renderizado en React Strict Mode
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const transactionAmount = useMemo(() => total.toFixed(2), [total]);
  const originalTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.originalPrice ?? item.price) * item.quantity,
        0,
      ),
    [items],
  );

  // 1. Crear la preferencia de Mercado Pago (Checkout Pro)
  useEffect(() => {
    async function loadPreference() {
      if (!items.length) return;
      try {
        const origin = window.location.origin;
        const payload = {
          items: items.map((item) => ({
            title: item.name,
            quantity: item.quantity,
            currencyId: "ARS",
            unitPrice: item.price,
            pictureUrl: item.imagePublicId
              ? `https://res.cloudinary.com/${cloudName}/image/upload/${item.imagePublicId}`
              : null,
          })),
          backUrls: {
            success: `${origin}/checkout/success`,
            failure: `${origin}/checkout/failure`,
            pending: `${origin}/checkout/pending`,
          },
        };
        const result = await createPreference(payload);
        setPreferenceId(result.id);
      } catch (error) {
        console.error("Error preference:", error);
      }
    }
    loadPreference();
  }, [items, cloudName]);

  // 2. Inicializar SDK y Campos Seguros (Custom Checkout)
  useEffect(() => {
    if (!mpReady || !mpRef.current || mountedFields.current) return;

    const mp = mpRef.current;
    mountedFields.current = true;

    // Montar campos de tarjeta
    const cardNumberElement = mp.fields
      .create("cardNumber", { placeholder: "Número de tarjeta" })
      .mount("form-checkout__cardNumber");
    const expirationDateElement = mp.fields
      .create("expirationDate", { placeholder: "MM/YY" })
      .mount("form-checkout__expirationDate");
    const securityCodeElement = mp.fields
      .create("securityCode", { placeholder: "CVV" })
      .mount("form-checkout__securityCode");

    const issuerElement = document.getElementById(
      "form-checkout__issuer",
    ) as HTMLSelectElement;
    const installmentsElement = document.getElementById(
      "form-checkout__installments",
    ) as HTMLSelectElement;
    const paymentMethodElement = document.getElementById(
      "paymentMethodId",
    ) as HTMLInputElement;

    // EVENTO CLAVE: Cuando el usuario escribe el BIN (primeros 6-8 dígitos)
    cardNumberElement.on("binChange", async (data: { bin: string }) => {
      const { bin } = data;
      if (!bin) return;

      try {
        // A. Obtener método de pago (Visa, Mastercard, etc)
        const { results } = await mp.getPaymentMethods({ bin });
        const paymentMethod = results[0];
        paymentMethodElement.value = paymentMethod.id;

        // B. Actualizar largo de seguridad según la tarjeta
        securityCodeElement.update({
          settings: paymentMethod.settings[0].security_code,
        });

        // C. Obtener Bancos Emisores
        const issuers = await mp.getIssuers({
          paymentMethodId: paymentMethod.id,
          bin,
        });
        renderSelectOptions(issuerElement, issuers);

        // D. Obtener Cuotas
        const installments = await mp.getInstallments({
          amount: transactionAmount,
          bin,
          paymentTypeId: "credit_card",
        });
        renderSelectOptions(installmentsElement, installments[0].payer_costs, {
          label: "recommended_message",
          value: "installments",
        });
      } catch (e) {
        console.error("Error al obtener datos de tarjeta:", e);
      }
    });

    // Cargar tipos de documento al inicio
    (async () => {
      const idTypes = await mp.getIdentificationTypes();
      const idElement = document.getElementById(
        "form-checkout__identificationType",
      ) as HTMLSelectElement;
      renderSelectOptions(idElement, idTypes);
    })();
  }, [mpReady, transactionAmount]);

  // 3. Renderizar Wallet Brick (Checkout Pro)
  useEffect(() => {
    if (mpReady && mpRef.current && preferenceId) {
      mpRef.current.bricks().create("wallet", "walletBrick_container", {
        initialization: { preferenceId },
      });
    }
  }, [mpReady, preferenceId]);

  // Función auxiliar para llenar selects
  function renderSelectOptions(
    element: HTMLSelectElement,
    options: any[],
    fields = { label: "name", value: "id" },
  ) {
    element.options.length = 0;
    const fragment = document.createDocumentFragment();
    options.forEach((opt) => {
      const el = document.createElement("option");
      el.value = opt[fields.value];
      el.textContent = opt[fields.label];
      fragment.appendChild(el);
    });
    element.appendChild(fragment);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mpRef.current) return;

    setIsProcessing(true);
    setMessage("");

    try {
      // 1. Obtener datos del formulario
      const fullName = (document.getElementById("form-checkout__fullName") as HTMLInputElement).value;
      const email = (document.getElementById("form-checkout__email") as HTMLInputElement).value;
      const phone = (document.getElementById("form-checkout__phone") as HTMLInputElement).value;
      const dni = (document.getElementById("form-checkout__dni") as HTMLInputElement).value;
      const address = (document.getElementById("form-checkout__address") as HTMLInputElement).value;
      const city = (document.getElementById("form-checkout__city") as HTMLInputElement).value;
      const postalCode = (document.getElementById("form-checkout__postalCode") as HTMLInputElement).value;
      const cardholderName = (document.getElementById("form-checkout__cardholderName") as HTMLInputElement).value;
      const identificationType = (document.getElementById("form-checkout__identificationType") as HTMLSelectElement).value;
      const identificationNumber = (document.getElementById("form-checkout__identificationNumber") as HTMLInputElement).value;
      const installments = parseInt((document.getElementById("form-checkout__installments") as HTMLSelectElement).value, 10);
      const paymentMethodId = (document.getElementById("paymentMethodId") as HTMLInputElement).value;

      // 2. Crear orden en el backend
      const orderResult = await createOrder({
        fullName,
        email,
        phone,
        dni,
        address,
        city,
        postalCode,
        items: items.map((item) => ({
          productVariantId: item.variantId,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
      });

      // 3. Crear token de tarjeta con MercadoPago
      const tokenResult = await mpRef.current.fields.createCardToken({
        cardholderName,
        identificationType,
        identificationNumber,
      });

      // 4. Procesar pago
      const paymentResult = await processPayment({
        token: tokenResult.id,
        transactionAmount: total,
        description: `Orden #${orderResult.id}`,
        installments,
        paymentMethodId,
        email,
        orderId: orderResult.id,
      });

      // 5. Si el pago es exitoso, limpiar carrito y redirigir
      if (paymentResult.status === "approved") {
        clearCart();
        router.push(`/checkout/success?orderId=${orderResult.id}`);
      } else {
        setMessage(`El pago no fue aprobado. Estado: ${paymentResult.status}`);
      }
    } catch (e: any) {
      console.error("Error en pago:", e);
      // MercadoPago puede devolver errores en diferentes formatos
      let errorMsg = "Error al procesar el pago.";
      if (e.message) {
        errorMsg = e.message;
      } else if (Array.isArray(e)) {
        errorMsg = e.map((err: any) => err.message || err.description || JSON.stringify(err)).join(", ");
      } else if (typeof e === "object") {
        errorMsg = JSON.stringify(e);
      }
      setMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!items.length)
    return <div className="card text-center py-10">Tu carrito está vacío.</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          const MpConstructor = (window as MpWindow).MercadoPago;
          if (MpConstructor && process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
            mpRef.current = new MpConstructor(
              process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
              { locale: "es-AR" },
            );
            setMpReady(true);
          }
        }}
      />

      {/* Checkout Pro Section */}
      <section className="card p-6 border rounded-xl shadow-sm bg-white space-y-4">
        <h2 className="text-xl font-bold">Mercado Pago</h2>
        <div id="walletBrick_container" />
      </section>

      {/* Custom Checkout Form */}
      <form
        ref={formRef}
        id="form-checkout"
        className="card p-6 border rounded-xl shadow-sm bg-white space-y-6"
        onSubmit={handleSubmit}
      >
        {message && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Datos del comprador */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Datos del comprador</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              id="form-checkout__fullName"
              placeholder="Nombre completo"
              className="rounded-xl border p-3 w-full"
              required
            />
            <input
              type="email"
              id="form-checkout__email"
              placeholder="Email"
              className="rounded-xl border p-3 w-full"
              required
            />
            <input
              type="tel"
              id="form-checkout__phone"
              placeholder="Teléfono"
              className="rounded-xl border p-3 w-full"
              required
            />
            <input
              type="text"
              id="form-checkout__dni"
              placeholder="DNI"
              className="rounded-xl border p-3 w-full"
              required
            />
            <input
              type="text"
              id="form-checkout__address"
              placeholder="Dirección"
              className="rounded-xl border p-3 w-full md:col-span-2"
              required
            />
            <input
              type="text"
              id="form-checkout__city"
              placeholder="Ciudad"
              className="rounded-xl border p-3 w-full"
              required
            />
            <input
              type="text"
              id="form-checkout__postalCode"
              placeholder="Código postal"
              className="rounded-xl border p-3 w-full"
              required
            />
          </div>
        </section>

        {/* Datos de la tarjeta */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Datos de pago</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Número de tarjeta
              </label>
              <div
                id="form-checkout__cardNumber"
                className="mp-input-container"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">
                Expiración
              </label>
              <div
                id="form-checkout__expirationDate"
                className="mp-input-container"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">
                CVV
              </label>
              <div
                id="form-checkout__securityCode"
                className="mp-input-container"
              />
            </div>

            <input
              type="text"
              id="form-checkout__cardholderName"
              placeholder="Nombre en la tarjeta"
              className="rounded-xl border p-3 w-full"
              required
            />
            <select
              id="form-checkout__issuer"
              className="rounded-xl border p-3 w-full"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Banco emisor
              </option>
            </select>

            <select
              id="form-checkout__installments"
              className="rounded-xl border p-3 w-full"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Cuotas
              </option>
            </select>

            <select
              id="form-checkout__identificationType"
              className="rounded-xl border p-3 w-full"
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
              placeholder="Número de documento"
              className="rounded-xl border p-3 w-full"
              required
            />
          </div>
        </section>

        {/* Hidden inputs */}
        <input id="paymentMethodId" type="hidden" />

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-gray-500 text-sm">Total a pagar</p>
            {originalTotal > total ? (
              <>
                <p className="text-xs text-slate-400 line-through">
                  ${originalTotal.toLocaleString("es-AR")}
                </p>
                <p className="text-2xl font-bold">
                  ${total.toLocaleString("es-AR")}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold">
                ${total.toLocaleString("es-AR")}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Procesando..." : "Pagar ahora"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .mp-input-container {
          height: 45px;
          min-height: 45px;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 8px;
          background-color: white;
          margin-bottom: 1rem;
          padding: 10px; /* Espacio para que el texto no toque los bordes */
        }
        #form-checkout__cardNumber,
        #form-checkout__expirationDate,
        #form-checkout__securityCode {
          height: 48px;
          display: block;
        }
      `}</style>
    </div>
  );
}
