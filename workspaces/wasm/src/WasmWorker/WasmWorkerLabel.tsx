import { CircleIcon } from 'lucide-react';
import { Box, Label, Motion, Text } from 'preshape';
import { useWasmApi } from '../WasmApi/useWasmApi';

export default function WasmWorkerLabel() {
  const { isLoading } = useWasmApi();

  return (
    <Label
      backgroundColor="background-shade-4"
      borderColor="background-shade-2"
      borderSize="x1"
      paddingRight="x3"
    >
      <Box alignChildrenVertical="middle" flex="horizontal" gap="x2">
        <Text textColor={isLoading ? 'accent-shade-4' : 'positive-shade-4'}>
          <Motion
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{
              ease: 'easeInOut',
              duration: 1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <CircleIcon size="0.75rem" fill="currentColor" />
          </Motion>
        </Text>

        <Text textColor="text-shade-1" size="x2">
          Wasm WebWorker
        </Text>
      </Box>
    </Label>
  );
}
