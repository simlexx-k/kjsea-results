"use client"

import * as React from "react"
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"
import { Button } from "@/app/components/ui/button" // We'll need a button component too, or use standard HTML button with classes

// Define interfaces
import { StudentResult } from "@/app/types";

const SUBJECT_MAP: Record<string, string> = {
    "901": "English",
    "902": "Kiswahili",
    "903": "Mathematics",
    "905": "Integrated Science",
    "906": "Agriculture",
    "907": "Social Studies",
    "908": "Christian Religious Education",
    "911": "Creative Arts & Sports",
    "912": "Pre‑technical Studies",
};

export const ResultsTable: React.FC<{ data: StudentResult[] }> = ({ data }) => {
    const [sorting, setSorting] = React.useState<SortingState>([])

    const columns: ColumnDef<StudentResult>[] = [
        /*{
            accessorKey: "input_assessment",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center hover:text-black"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Assessment #
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                )
            },
        },*/
        {
            accessorKey: "input_name",
            header: "Name",
        },
        {
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => row.original.gender?.trim(),
        },

        // Generate columns for each subject
        ...Object.entries(SUBJECT_MAP).map(([code, name]) => ({
            id: `subject_${code}`,
            header: name,
            accessorFn: (row: StudentResult) => {
                const subj = row.subjects?.find((s) => s.subjectCode === code);
                return subj ? `${subj.subjectGrade} (${subj.subjectPoints})` : '-';
            },
        })),
        // Pathway columns
        {
            accessorKey: "artsAndSportsPathway",
            header: ({ column }) => (
                <button
                    className="flex items-center hover:text-black"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Arts & Sports
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("artsAndSportsPathway")}</div>,
        },
        {
            accessorKey: "socialSciencePathway",
            header: ({ column }) => (
                <button
                    className="flex items-center hover:text-black"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Social Science
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("socialSciencePathway")}</div>,
        },
        {
            accessorKey: "stemPathway",
            header: ({ column }) => (
                <button
                    className="flex items-center hover:text-black"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    STEM
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("stemPathway")}</div>,
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    return (
        <div className="rounded-md border mt-6 print:border-0 print:shadow-none print:mt-0 overflow-x-auto max-w-[calc(100vw-2rem)] mx-auto scrollbar-visible">
            <Table className="print:text-xs whitespace-nowrap">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
