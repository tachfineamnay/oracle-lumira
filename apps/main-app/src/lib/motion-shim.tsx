import React from 'react';

type MotionProps = {
  children?: React.ReactNode;
  [key: string]: any;
};

type MotionComponent = React.FC<MotionProps>;

type MotionProxy = {
  [K in keyof JSX.IntrinsicElements]: MotionComponent;
} & ((component: React.ElementType) => MotionComponent);

const createMotionComponent = (Component: React.ElementType): MotionComponent => {
  const MotionComp: MotionComponent = ({ children, ...rest }) => {
    const {
      initial,
      animate,
      whileHover,
      whileTap,
      whileInView,
      exit,
      transition,
      layout,
      viewport,
      ...domProps
    } = rest;

    return <Component {...domProps}>{children}</Component>;
  };

  return MotionComp;
};

const motion = new Proxy(createMotionComponent as any, {
  apply(_target, _thisArg, argArray: [React.ElementType]) {
    const Component = argArray?.[0] ?? 'div';
    return createMotionComponent(Component);
  },
  get(_target, prop: string) {
    return createMotionComponent(prop as any);
  },
}) as MotionProxy;

export const AnimatePresence: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const useReducedMotion = () => false;

export const useMotionValue = <T,>(initial: T) => {
  let current = initial;
  return {
    get: () => current,
    set: (value: T) => {
      current = value;
    },
    on: () => undefined,
    clearListeners: () => undefined,
  } as any;
};

export const animate = (..._args: any[]) => ({
  stop: () => undefined,
});

export { motion };
export const m = motion;

