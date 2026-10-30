"use client";

/**
 * The Coach agent's own permissions. The SDK composer stays disabled until they
 * are in (web-utils ≥ 2.18), and only the SDK's `MentorProvider` loads them —
 * the wallet mounts none, so the Coach loads them here.
 */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";
import { useGetRbacPermissionsMutation } from "@iblai/iblai-js/data-layer";
import {
  markMentorPermissionsLoaded,
  updateRbacPermissions,
  useMentorSettings,
} from "@iblai/iblai-js/web-utils";

/** Stores the platform's answer, then marks it in — granted, denied or failed alike. */
export async function loadAgentPermissions(dispatch: Dispatch, request: () => Promise<unknown>) {
  try {
    const permissions = await request();
    dispatch(
      updateRbacPermissions((permissions ?? {}) as Parameters<typeof updateRbacPermissions>[0]),
    );
  } catch (error) {
    console.error("failed to load the Coach agent's permissions", error);
  }
  dispatch(markMentorPermissionsLoaded());
}

export function useAgentPermissions(agentId: string, tenantKey: string) {
  const dispatch = useDispatch();
  const { mentorDbId } = useMentorSettings({ mentorId: agentId, tenantKey }).data;
  const [getRbacPermissions] = useGetRbacPermissionsMutation();

  useEffect(() => {
    if (!mentorDbId) return;
    void loadAgentPermissions(dispatch, () =>
      getRbacPermissions({
        requestBody: { platform_key: tenantKey, resources: [`/mentors/${mentorDbId}/`] },
      }).unwrap(),
    );
  }, [dispatch, getRbacPermissions, mentorDbId, tenantKey]);
}
