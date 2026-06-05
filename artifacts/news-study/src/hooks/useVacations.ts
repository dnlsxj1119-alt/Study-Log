import { useQueryClient } from "@tanstack/react-query";
import {
  useListVacations,
  useCreateVacation,
  useUpdateVacation,
  useDeleteVacation,
  getListVacationsQueryKey,
} from "@workspace/api-client-react";
import type { VacationPeriod } from "@workspace/api-client-react";

export type { VacationPeriod };

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useVacations() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useListVacations();
  const vacations: VacationPeriod[] = data;

  const createMutation = useCreateVacation();
  const updateMutation = useUpdateVacation();
  const deleteMutation = useDeleteVacation();

  const queryKey = getListVacationsQueryKey();

  async function addVacation(input: {
    startDate: string;
    endDate: string;
    memo: string;
  }): Promise<void> {
    const vac: VacationPeriod = {
      id: generateId(),
      startDate: input.startDate,
      endDate: input.endDate,
      memo: input.memo,
      createdAt: new Date().toISOString(),
    };
    await createMutation.mutateAsync({ data: vac });
    await queryClient.invalidateQueries({ queryKey });
  }

  async function updateVacation(vac: VacationPeriod): Promise<void> {
    await updateMutation.mutateAsync({ id: vac.id, data: vac });
    await queryClient.invalidateQueries({ queryKey });
  }

  async function deleteVacation(id: string): Promise<void> {
    await deleteMutation.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey });
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    vacations,
    isLoading,
    isMutating,
    addVacation,
    updateVacation,
    deleteVacation,
  };
}
