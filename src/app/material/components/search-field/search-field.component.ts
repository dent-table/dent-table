import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Optional, Self, ViewChild } from "@angular/core";
import { MatFormField, MatFormFieldAppearance, MatFormFieldControl } from "@angular/material/form-field";
import { ControlValueAccessor, FormBuilder, FormControl, FormControlDirective, NgControl } from "@angular/forms";
import { Subject } from "rxjs";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { FocusMonitor } from "@angular/cdk/a11y";
import { ThemePalette } from "@angular/material/core";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
  animations: [
    trigger("easeInOut", [
      state("true", style({width: "*"})),
      state("false", style({width: 0})),
      transition("false => true", animate("250ms ease-in")),
      transition("true => false", animate("200ms ease-out"))
    ])
  ]
})
export class SearchFieldComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy, OnInit {
  static nextId = 0;

  @Input() appearance: MatFormFieldAppearance = "standard";
  @Input() color: ThemePalette = "primary";

  searchVisible = false;

  formControl: FormControl;

  focused = false;
  stateChanges = new Subject<void>();

  private _placeholder: string;
  private _required = false;
  private _disabled = false;

  controlType = 'search-field';

  get control(): FormControl {
    return this.formControl;
  }
  @Input()
  get value(): string | null {
    // return val.length === 4 ? val : null;
    return this.formControl.value;
  }
  set value(val: string | null) {
    val = val || '';
    this.formControl.setValue(val);
    if (this._onChange) this._onChange(val);
    this.stateChanges.next();
  }

  @Input()
  get placeholder(): string | null {
    return this._placeholder;
  }
  set placeholder(placeholder: string | null) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(req: boolean) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.disabled ? this.control.disable() : this.control.enable();
    this.setDisabled();
    this.stateChanges.next();
  }

  @Input('aria-describedby') userAriaDescribedBy: string;

  get errorState(): boolean {
    return (this.ngControl.errors !== null || this.control.errors !== null);
  }

  // ControlValueAccessor elements
  @ViewChild(FormControlDirective, {static: true})
  formControlDirective: FormControlDirective;

  @ViewChild('input', {static: true, read: ElementRef})
  inputElementRef: ElementRef;

  @HostBinding() id = `search-field-${SearchFieldComponent.nextId++}`;

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get empty(): boolean {
    return !this.control.value;
  }

  @HostBinding('attr.aria-describedby') describedBy = '';
  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  // onContainerClick(event: MouseEvent) {
  //   if ((event.target as Element).tagName.toLowerCase() != 'input') {
  //     this.elRef.nativeElement.querySelector('input').focus();
  //   }
  // }

  onContainerClick(event: MouseEvent): void {
    if(!this.disabled) {
      this._onTouched();
    }
  }

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fb: FormBuilder,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    @Optional() public parentFormField: MatFormField,
  ) {
    this.formControl = this.fb.control('');
    this.setDisabled();

    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(elRef, true).subscribe(origin => {
      this.focused = !this.disabled && !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    this.formControl.valueChanges.subscribe(
      () => {
        const value = this.value;
        if(this._onChange) this._onChange(value);
        this.stateChanges.next();
      }
    );
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  // ControlValueAccessor interface methods
  clearInput(): void {
    this.formControl.setValue('');
  }
  writeValue(obj: any): void {
    this.value = obj;
  }

  _onChange: (_:any) => void;
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  _onTouched: () => void;
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private setDisabled() {
    if(this.disabled && this.control) {
      this.control.disable();
    } else if(this.control) {
      this.control.enable();
    }
  }

  focus(): void {
    if (!this.disabled) {
      this.inputElementRef.nativeElement.focus();
    }
  }

  close(): void {
    this.searchVisible = false;
    this.value = "";
  }

  open(): void {
    this.searchVisible = true;
    this.focus();
  }
}
