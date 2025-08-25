import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  private dataSource = new BehaviorSubject<number>(1);
  currentData = this.dataSource.asObservable();

  changeData(data: number) {
    this.dataSource.next(data);
  }

}
