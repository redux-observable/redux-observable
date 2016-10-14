import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operator/filter';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';

export const $$filter = Symbol('@@filter');
export const $$map = Symbol('@@map');
export const $$switchMap = Symbol('@@switchMap');

Observable.prototype[$$filter] = filter;
Observable.prototype[$$map] = map;
Observable.prototype[$$switchMap] = switchMap;
