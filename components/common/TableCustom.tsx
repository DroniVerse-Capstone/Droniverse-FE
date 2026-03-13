import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TableCustomProps<T> = {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
};

export function TableCustom<T>({
  headers,
  data,
  renderRow,
}: TableCustomProps<T>) {
  return (
    <div className="rounded border border-greyscale-700">
      <Table>
        <TableHeader>
          <TableRow className="border-greyscale-700">
            {headers.map((header, idx) => (
              <TableHead key={idx}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow key={idx} className="border-greyscale-700 hover:bg-greyscale-800">
              {renderRow(item, idx)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}