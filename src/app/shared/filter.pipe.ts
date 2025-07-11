import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], search: string, field: string): any[] {
    if (!items || !search) return items;

    const lowerSearch = search.toLowerCase();

    return items.filter(item => item[field]?.toLowerCase().includes(lowerSearch));
  }
}
