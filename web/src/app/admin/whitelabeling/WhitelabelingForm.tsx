"use client";

import { useRouter } from "next/navigation";
import { Settings } from "@/app/admin/settings/interfaces";
import { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  BooleanFormField,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "@/components/icons/icons";

export function WhitelabelingForm() {
  const router = useRouter();
  const settings = useContext(SettingsContext);
  
  if (!settings) {
    return null;
  }
  
  async function updateSettings(newValues: Partial<Settings>) {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...settings?.settings,
        ...newValues,
      }),
    });
    if (response.ok) {
      router.refresh();
    } else {
      const errorMsg = (await response.json()).detail;
      alert(`Failed to update settings. ${errorMsg}`);
    }
  }

  return (
    <div>
      <Formik
        initialValues={{
          custom_popup_header: settings.settings.custom_popup_header || "",
          custom_popup_content: settings.settings.custom_popup_content || "",
          custom_lower_disclaimer_content: 
            settings.settings.custom_lower_disclaimer_content || "",
          enable_consent_screen: 
            settings.settings.enable_consent_screen || false,
        }}
        validationSchema={Yup.object().shape({
          custom_popup_header: Yup.string().nullable(),
          custom_popup_content: Yup.string().nullable(),
          custom_lower_disclaimer_content: Yup.string().nullable(),
          enable_consent_screen: Yup.boolean().nullable(),
        })}
        onSubmit={async (values, formikHelpers) => {
          formikHelpers.setSubmitting(true);
          await updateSettings(values);
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon size={20} className="text-blue-600" />
              <Text className="text-md">
                These whitelabeling settings are part of the SR compliance toolkit to help maintain privacy standards.
              </Text>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Consent Screen Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Consent & Popup Settings</CardTitle>
                  <CardDescription>Configure how users are informed about terms of use</CardDescription>
                </CardHeader>
                <CardContent>
                  <BooleanFormField
                    name="enable_consent_screen"
                    label="Enable Consent Screen"
                    subtext="If enabled, users will be required to agree to terms before accessing the application on first login."
                    disabled={isSubmitting}
                  />
                  
                  <div className="mt-4">
                    <TextFormField
                      label={values.enable_consent_screen ? "Consent Screen Header" : "Popup Header"}
                      name="custom_popup_header"
                      subtext={values.enable_consent_screen
                        ? "The title for the consent screen shown on initial visit (defaults to 'Terms of Use' if blank)"
                        : "The title for the popup shown on initial visit (defaults to 'Welcome to Onyx' if blank)"}
                      placeholder={values.enable_consent_screen ? "Consent Screen Header" : "Initial Popup Header"}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <TextFormField
                      label={values.enable_consent_screen ? "Consent Screen Content" : "Popup Content"}
                      name="custom_popup_content"
                      subtext={values.enable_consent_screen
                        ? "Custom Markdown content for the consent screen (shown on first visit)"
                        : "Custom Markdown content for the welcome popup (shown on first visit)"}
                      placeholder={values.enable_consent_screen ? "Your consent screen content..." : "Your popup content..."}
                      isTextArea
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Footer Text Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Chat Footer Text</CardTitle>
                  <CardDescription>Add disclaimer or compliance information</CardDescription>
                </CardHeader>
                <CardContent>
                  <TextFormField
                    label="Chat Footer Text"
                    name="custom_lower_disclaimer_content"
                    subtext="Custom Markdown content that will be displayed at the bottom of the Chat page. Use this for compliance notices, disclaimers, or important user information."
                    placeholder="Your disclaimer content..."
                    isTextArea
                    disabled={isSubmitting}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
} 