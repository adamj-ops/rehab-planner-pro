"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  IconClipboardCheck, 
  IconPlus, 
  IconTrash, 
  IconHome2,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import {
  conditionAssessmentSchema,
  ConditionAssessmentFormData,
  CONDITION_LEVELS,
  ROOM_TYPES,
  FLOOR_LEVELS,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";

// Display labels
const CONDITION_LABELS: Record<string, { label: string; color: string; icon: typeof IconCircleCheck }> = {
  excellent: { label: "Excellent", color: "bg-green-500", icon: IconCircleCheck },
  good: { label: "Good", color: "bg-blue-500", icon: IconCircleCheck },
  fair: { label: "Fair", color: "bg-yellow-500", icon: IconAlertTriangle },
  poor: { label: "Poor", color: "bg-orange-500", icon: IconAlertTriangle },
  gut_needed: { label: "Gut Rehab Needed", color: "bg-red-500", icon: IconAlertTriangle },
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  bedroom: "Bedroom",
  living_room: "Living Room",
  dining_room: "Dining Room",
  family_room: "Family Room",
  office: "Office/Den",
  laundry: "Laundry Room",
  garage: "Garage",
  basement: "Basement",
  attic: "Attic",
  exterior: "Exterior",
  other: "Other",
};

const FLOOR_LEVEL_LABELS: Record<string, string> = {
  basement: "Basement",
  main: "Main Floor",
  upper: "Upper Floor",
  attic: "Attic",
};

const defaultRoom = {
  room_type: "bedroom" as const,
  room_name: "",
  floor_level: "main" as const,
  overall_condition: undefined,
  condition_notes: "",
  needs_renovation: false,
};

export function ConditionAssessmentForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();

  const storedData = getStepData<ConditionAssessmentFormData>(2);
  
  const form = useForm<ConditionAssessmentFormData>({
    resolver: zodResolver(conditionAssessmentSchema),
    defaultValues: {
      overall_condition: undefined,
      condition_notes: "",
      rooms: [
        { room_type: "kitchen", room_name: "Kitchen", floor_level: "main", needs_renovation: false },
        { room_type: "living_room", room_name: "Living Room", floor_level: "main", needs_renovation: false },
        { room_type: "bathroom", room_name: "Primary Bathroom", floor_level: "main", needs_renovation: false },
        { room_type: "bedroom", room_name: "Primary Bedroom", floor_level: "main", needs_renovation: false },
      ],
      ...storedData,
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  // Auto-save on changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      setStepData(2, data as Partial<ConditionAssessmentFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepData]);

  const onSubmit = async (data: ConditionAssessmentFormData) => {
    setStepData(2, data);
    markStepComplete(2);
    await goToNextStep();
  };

  const handleSave = async () => {
    const data = form.getValues();
    setStepData(2, data);
    await saveDraft();
  };

  const addRoom = () => {
    append(defaultRoom);
  };

  const overallCondition = form.watch("overall_condition");
  const rooms = form.watch("rooms");
  const roomsNeedingWork = rooms?.filter((r) => r.needs_renovation).length || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Condition Assessment</h1>
          <p className="text-muted-foreground">
            Evaluate the current condition of the property and identify areas needing renovation.
          </p>
        </div>

        {/* Overall Condition Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClipboardCheck className="h-5 w-5" />
              Overall Property Condition
            </CardTitle>
            <CardDescription>
              Rate the general condition of the entire property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="overall_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 md:grid-cols-5 gap-3"
                    >
                      {CONDITION_LEVELS.map((level) => {
                        const config = CONDITION_LABELS[level];
                        const isSelected = field.value === level;
                        return (
                          <FormItem key={level}>
                            <FormControl>
                              <label
                                className={cn(
                                  "flex flex-col items-center justify-center p-4 border-2 cursor-pointer transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                                )}
                              >
                                <RadioGroupItem value={level} className="sr-only" />
                                <div className={cn("w-3 h-3 rounded-full mb-2", config.color)} />
                                <span className="text-sm font-medium text-center">
                                  {config.label}
                                </span>
                              </label>
                            </FormControl>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the overall condition, any major issues, or notable features..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about the property&apos;s general state
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Room-by-Room Assessment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconHome2 className="h-5 w-5" />
                  Room-by-Room Assessment
                </CardTitle>
                <CardDescription>
                  Evaluate each room individually
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {roomsNeedingWork > 0 && (
                  <Badge variant="secondary">
                    {roomsNeedingWork} need{roomsNeedingWork === 1 ? "s" : ""} work
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRoom}
                  className="rounded-none"
                >
                  <IconPlus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconHome2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rooms added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRoom}
                  className="mt-4 rounded-none"
                >
                  <IconPlus className="h-4 w-4 mr-1" />
                  Add First Room
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {fields.map((field, index) => {
                  const roomData = rooms?.[index];
                  const needsWork = roomData?.needs_renovation;
                  const roomCondition = roomData?.overall_condition;
                  
                  return (
                    <AccordionItem key={field.id} value={field.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {needsWork ? (
                              <IconAlertTriangle className="h-4 w-4 text-orange-500" />
                            ) : (
                              <IconCircleCheck className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-medium">
                              {roomData?.room_name || ROOM_TYPE_LABELS[roomData?.room_type || "other"]}
                            </span>
                          </div>
                          {roomCondition && (
                            <Badge variant="outline" className="ml-auto mr-4">
                              {CONDITION_LABELS[roomCondition]?.label}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <FormField
                              control={form.control}
                              name={`rooms.${index}.room_type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Type</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {ROOM_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {ROOM_TYPE_LABELS[type]}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`rooms.${index}.room_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Primary Bedroom" 
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`rooms.${index}.floor_level`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Floor Level</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select floor" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {FLOOR_LEVELS.map((level) => (
                                        <SelectItem key={level} value={level}>
                                          {FLOOR_LEVEL_LABELS[level]}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`rooms.${index}.overall_condition`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Room Condition</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {CONDITION_LEVELS.map((level) => {
                                      const config = CONDITION_LABELS[level];
                                      const isSelected = field.value === level;
                                      return (
                                        <FormItem key={level}>
                                          <FormControl>
                                            <label
                                              className={cn(
                                                "inline-flex items-center gap-2 px-3 py-2 border cursor-pointer transition-all",
                                                isSelected
                                                  ? "border-primary bg-primary/5"
                                                  : "border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                                              )}
                                            >
                                              <RadioGroupItem value={level} className="sr-only" />
                                              <div className={cn("w-2 h-2 rounded-full", config.color)} />
                                              <span className="text-sm">{config.label}</span>
                                            </label>
                                          </FormControl>
                                        </FormItem>
                                      );
                                    })}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between">
                            <FormField
                              control={form.control}
                              name={`rooms.${index}.needs_renovation`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-3">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 cursor-pointer">
                                    Needs Renovation
                                  </FormLabel>
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <IconTrash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`rooms.${index}.condition_notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe specific issues or features..."
                                    className="min-h-[80px]"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>

        <WizardFooter
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={form.formState.isValid || fields.length > 0}
          form={form}
        />
      </form>
    </Form>
  );
}
