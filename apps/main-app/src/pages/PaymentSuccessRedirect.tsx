import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId') || searchParams.get('order_id') || '';
    const email = searchParams.get('email') || '';
    const qs = new URLSearchParams();
    if (orderId) qs.set('order_id', orderId);
    if (email) qs.set('email', email);
    navigate(`/confirmation?${qs.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

export default PaymentSuccessRedirect;

