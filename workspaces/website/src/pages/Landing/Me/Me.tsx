import { Box, Image } from 'preshape';
import { useEffect, useRef, useState } from 'react';
import eyeballImage from '../../../assets/eyeball.png';
import meSpriteImage from '../../../assets/me_sprite.png';
import noiseImage from '../../../assets/noise.png';

const baseSize = 400;
const eyeballSize = 35;
const eyeballRange: [number, number] = [-0.1, 0.1];

const backgroundPositions = {
  resting: '0px 0px',
  blinking: `-${baseSize}px 0px`,
  talking: `-${baseSize * 2}px 0px`,
  blinking_talking: `-${baseSize * 3}px 0px`,
};

export default function Me({ size = 400 }: { size?: number }) {
  const refResetFace = useRef<boolean>(false);
  const refEyeballLeft = useRef<HTMLImageElement>(null);
  const refEyeballRight = useRef<HTMLImageElement>(null);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showMouth, setShowMouth] = useState<boolean>(false);
  const scale = size / baseSize;

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setIsBlinking((isBlinking) => !isBlinking);

        setShowMouth((showMouth) => {
          if (showMouth) {
            return false;
          } else if (Math.random() > 0.75) {
            return true;
          } else {
            return false;
          }
        });

        if (refResetFace.current) {
          refResetFace.current = false;

          setShowMouth(false);

          if (refEyeballLeft.current) {
            refEyeballLeft.current.style.transform = 'translate(0px, 0px)';
          }

          if (refEyeballRight.current) {
            refEyeballRight.current.style.transform = 'translate(0px, 0px)';
          }
        }
      },

      isBlinking ? 250 : Math.random() * 3000
    );

    return () => clearTimeout(timeout);
  }, [isBlinking, setIsBlinking]);

  useEffect(() => {
    let resetEyesTimeout: NodeJS.Timeout;

    const getDistanceFromCenter = (
      el: HTMLImageElement,
      x: number,
      y: number
    ) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dy = y - centerY;
      const dx = x - centerX;

      return [dx / centerX, dy / centerY];
    };

    function shiftEyeball(
      x: number,
      y: number,
      el: HTMLImageElement | null,
      xBounds: [number, number],
      yBounds: [number, number]
    ) {
      if (!el) return;

      const [dx, dy] = getDistanceFromCenter(el, x, y);
      const translateX = Math.min(Math.max(dx, xBounds[0]), xBounds[1]);
      const translateY = Math.min(Math.max(dy, yBounds[0]), yBounds[1]);

      el.style.transform = `translate(${translateX * 100}%, ${
        translateY * 100
      }%)`;
    }

    function openMouth(x: number, y: number, el: HTMLImageElement | null) {
      if (!el) return;

      const [dx, dy] = getDistanceFromCenter(el, x, y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const showMouth = distance < 0.25 || dy > 0;

      setShowMouth(showMouth);
    }

    function handleMouseMove(event: MouseEvent) {
      shiftEyeball(
        event.clientX,
        event.clientY,
        refEyeballLeft.current,
        eyeballRange,
        eyeballRange
      );

      shiftEyeball(
        event.clientX,
        event.clientY,
        refEyeballRight.current,
        eyeballRange,
        eyeballRange
      );

      openMouth(event.clientX, event.clientY, refEyeballLeft.current);

      clearTimeout(resetEyesTimeout);

      resetEyesTimeout = setTimeout(() => {
        refResetFace.current = true;
      }, 1000);
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Box container width={size} height={size}>
      <Box
        absolute="top-left"
        backgroundColor="text-shade-1"
        borderColor="text-shade-1"
        borderSize="x3"
        borderRadius="x3"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <Box>
          <Image
            absolute="top-left"
            ref={refEyeballLeft}
            src={eyeballImage}
            width={eyeballSize}
            height={eyeballSize}
            zIndex={0}
            style={{
              top: 136,
              left: 152,
            }}
          />

          <Image
            absolute="top-left"
            ref={refEyeballRight}
            src={eyeballImage}
            width={eyeballSize}
            height={eyeballSize}
            zIndex={0}
            style={{ top: 134, left: 213 }}
          />

          <Box
            container
            width={baseSize}
            height={baseSize}
            zIndex={1}
            style={{
              backgroundImage: `url(${noiseImage}), url(${meSpriteImage})`,
              backgroundSize: 'cover',
              backgroundPosition:
                backgroundPositions[
                  (showMouth && isBlinking && 'blinking_talking') ||
                    (showMouth && 'talking') ||
                    (isBlinking && 'blinking') ||
                    'resting'
                ],
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
