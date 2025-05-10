"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "@/app/src/core/domain/entities/User";
import { getUsersList, UserList } from "@/app/src/services/userService";

const StaffList = () => {
  const [logs, setLogs] = useState<UserList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await getUsersList(page);
      setLogs(result.items);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch inbox:", err);
      setError("Failed to load logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleRefresh = () => fetchData();

  return (
    <div className="flex flex-col h-full mt-10 p-6 rounded-md shadow-lg">
      <div className="flex gap-2 mb-4 items-center">
        <h3 className="text-2xl font-semibold">Staff List</h3>
        <Button
          className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin text-black dark:text-white" />
          ) : (
            <RefreshCcw className="text-black dark:text-white" />
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
      )}

      <Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                <Loader2 className="mx-auto animate-spin text-gray-500" />
                <span className="text-sm text-gray-500 mt-2 block">
                  Loading
                </span>
              </TableCell>
            </TableRow>
          ) : logs.length > 0 ? (
            logs.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No Logs
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-center py-3">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default StaffList;
