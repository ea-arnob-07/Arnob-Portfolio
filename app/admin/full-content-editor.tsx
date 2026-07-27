"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useRef,
} from "react";
import {
  cloneSiteContent,
  type PortfolioSiteContent,
  type SectionHeading,
} from "../lib/site-content";

export type SiteEditorSection =
  | "profile"
  | "about"
  | "skills"
  | "recruiter"
  | "research"
  | "experience"
  | "more"
  | "contact";

type Props = {
  section: SiteEditorSection;
  content: PortfolioSiteContent;
  busy: boolean;
  uploadBusy: boolean;
  onChange: (content: PortfolioSiteContent) => void;
  onSave: () => void;
  onUploadProfile: (file: File) => void;
};

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel" | "number";
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  help?: string;
}) {
  return (
    <label>
      {label}
      <textarea
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

function HeadingFields({
  value,
  onChange,
}: {
  value: SectionHeading;
  onChange: (heading: SectionHeading) => void;
}) {
  return (
    <div className="admin-editor-section">
      <div className="admin-subheading">
        <span>SECTION HEADING</span>
        <h3>Title shown above this section</h3>
      </div>
      <div className="admin-form-grid">
        <Field
          label="Small label"
          onChange={(tag) => onChange({ ...value, tag })}
          value={value.tag}
        />
        <Field
          label="Main title"
          onChange={(title) => onChange({ ...value, title })}
          value={value.title}
        />
      </div>
      <Field
        label="Gradient title"
        onChange={(accent) => onChange({ ...value, accent })}
        value={value.accent}
      />
      <TextAreaField
        label="Subtitle"
        onChange={(subtitle) => onChange({ ...value, subtitle })}
        rows={2}
        value={value.subtitle}
      />
    </div>
  );
}

function EditorShell({
  eyebrow,
  title,
  description,
  busy,
  onSave,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  busy: boolean;
  onSave: () => void;
  children: ReactNode;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form className="admin-editor admin-site-editor" onSubmit={submit}>
      <div className="admin-editor-title">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
      <div className="admin-save-bar">
        <span>Changes appear on the live portfolio after saving.</span>
        <button
          className="admin-primary-button"
          disabled={busy}
          type="submit"
        >
          {busy ? "Saving…" : "Save This Section"}
        </button>
      </div>
    </form>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return <div className="admin-list-empty compact">{children}</div>;
}

function moveArrayItem<T>(
  items: T[],
  index: number,
  direction: -1 | 1,
) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return;
  [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
}

function ItemOrderControls({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="admin-item-order" aria-label="Position controls">
      <span>POSITION {String(index + 1).padStart(2, "0")}</span>
      <div>
        <button
          aria-label="Move up"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          title="Move up"
          type="button"
        >
          ↑
        </button>
        <button
          aria-label="Move down"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          title="Move down"
          type="button"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

function CompactOrderControls({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="admin-compact-order" aria-label="Position controls">
      <button
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        title="Move up"
        type="button"
      >
        ↑
      </button>
      <button
        aria-label="Move down"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
        title="Move down"
        type="button"
      >
        ↓
      </button>
    </div>
  );
}

export function FullContentEditor({
  section,
  content,
  busy,
  uploadBusy,
  onChange,
  onSave,
  onUploadProfile,
}: Props) {
  const uploadInput = useRef<HTMLInputElement>(null);
  const mutate = (updater: (draft: PortfolioSiteContent) => void) => {
    const next = cloneSiteContent(content);
    updater(next);
    onChange(next);
  };

  if (section === "profile") {
    const hero = content.hero;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const profilePreviewUrl =
      hero.profileImageUrl.startsWith("/") &&
      !hero.profileImageUrl.startsWith(`${basePath}/`)
        ? `${basePath}${hero.profileImageUrl}`
        : hero.profileImageUrl;
    return (
      <EditorShell
        busy={busy}
        description="Edit your identity, animated role carousel, first-page statistics, picture, and orbit labels."
        eyebrow="HERO & IDENTITY"
        onSave={onSave}
        title="Profile and first page"
      >
        <div className="admin-profile-editor">
          <div className="admin-profile-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Current profile" src={profilePreviewUrl} />
            <div>
              <strong>{hero.name}</strong>
              <span>{hero.roles[0] ?? "Portfolio owner"}</span>
            </div>
          </div>
          <div className="admin-upload-row">
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                if (file) onUploadProfile(file);
                event.target.value = "";
              }}
              ref={uploadInput}
              type="file"
            />
            <button
              disabled={uploadBusy}
              onClick={() => uploadInput.current?.click()}
              type="button"
            >
              {uploadBusy ? "Uploading…" : "Upload New Picture"}
            </button>
            <small>JPG, PNG, WebP or GIF · maximum 5 MB</small>
          </div>
        </div>

        <div className="admin-form-grid">
          <Field
            label="Full name"
            onChange={(name) => mutate((draft) => (draft.hero.name = name))}
            required
            value={hero.name}
          />
          <Field
            label="Availability badge"
            onChange={(badge) => mutate((draft) => (draft.hero.badge = badge))}
            value={hero.badge}
          />
        </div>
        <TextAreaField
          help="One role per line. These move continuously below your name."
          label="Animated roles"
          onChange={(value) =>
            mutate((draft) => (draft.hero.roles = splitLineList(value)))
          }
          rows={5}
          value={hero.roles.join("\n")}
        />
        <TextAreaField
          label="Hero description"
          onChange={(tagline) =>
            mutate((draft) => (draft.hero.tagline = tagline))
          }
          value={hero.tagline}
        />
        <div className="admin-form-grid">
          <Field
            label="Location"
            onChange={(location) =>
              mutate((draft) => (draft.hero.location = location))
            }
            value={hero.location}
          />
          <Field
            label="Focus line"
            onChange={(focusLine) =>
              mutate((draft) => (draft.hero.focusLine = focusLine))
            }
            value={hero.focusLine}
          />
        </div>
        <Field
          label="Profile image URL"
          onChange={(profileImageUrl) =>
            mutate(
              (draft) => (draft.hero.profileImageUrl = profileImageUrl),
            )
          }
          placeholder="Upload above, or paste an https:// image URL"
          value={hero.profileImageUrl}
        />

        <div className="admin-editor-section">
          <div className="admin-subheading">
            <span>FIRST-PAGE STATS</span>
            <h3>Small statistic cards</h3>
          </div>
          <div className="admin-array-grid">
            {hero.stats.map((stat, index) => (
              <div className="admin-array-card" key={`stat-${index}`}>
                <ItemOrderControls
                  index={index}
                  onMove={(direction) =>
                    mutate((draft) =>
                      moveArrayItem(draft.hero.stats, index, direction),
                    )
                  }
                  total={hero.stats.length}
                />
                <div className="admin-form-grid">
                  <Field
                    label="Value"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.hero.stats[index].value = value;
                      })
                    }
                    value={stat.value}
                  />
                  <Field
                    label="Label"
                    onChange={(label) =>
                      mutate((draft) => {
                        draft.hero.stats[index].label = label;
                      })
                    }
                    value={stat.label}
                  />
                </div>
                <button
                  className="admin-remove-button"
                  onClick={() =>
                    mutate((draft) => {
                      draft.hero.stats.splice(index, 1);
                    })
                  }
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="admin-add-button"
            onClick={() =>
              mutate((draft) => {
                draft.hero.stats.push({ value: "0", label: "New stat" });
              })
            }
            type="button"
          >
            + Add statistic
          </button>
        </div>

        <div className="admin-editor-section">
          <div className="admin-subheading">
            <span>PROFILE ORBIT</span>
            <h3>Labels around your picture</h3>
          </div>
          <div className="admin-array-grid">
            {hero.orbitLabels.map((label, index) => (
              <div className="admin-array-card" key={`orbit-${index}`}>
                <ItemOrderControls
                  index={index}
                  onMove={(direction) =>
                    mutate((draft) =>
                      moveArrayItem(
                        draft.hero.orbitLabels,
                        index,
                        direction,
                      ),
                    )
                  }
                  total={hero.orbitLabels.length}
                />
                <div className="admin-form-grid">
                  <Field
                    label="Large text"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.hero.orbitLabels[index].value = value;
                      })
                    }
                    value={label.value}
                  />
                  <Field
                    label="Small text"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.hero.orbitLabels[index].label = value;
                      })
                    }
                    value={label.label}
                  />
                </div>
                <button
                  className="admin-remove-button"
                  onClick={() =>
                    mutate((draft) => {
                      draft.hero.orbitLabels.splice(index, 1);
                    })
                  }
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {hero.orbitLabels.length < 6 ? (
            <button
              className="admin-add-button"
              onClick={() =>
                mutate((draft) => {
                  draft.hero.orbitLabels.push({
                    value: "New",
                    label: "Label",
                  });
                })
              }
              type="button"
            >
              + Add orbit label
            </button>
          ) : (
            <small>Six orbit positions are filled.</small>
          )}
        </div>
      </EditorShell>
    );
  }

  if (section === "about") {
    const about = content.about;
    return (
      <EditorShell
        busy={busy}
        description="Update the complete About section, highlight chips, and personal-information card."
        eyebrow="ABOUT CONTENT"
        onSave={onSave}
        title="About you"
      >
        <HeadingFields
          onChange={(heading) =>
            mutate((draft) => (draft.about.heading = heading))
          }
          value={about.heading}
        />
        <div className="admin-editor-section">
          <div className="admin-subheading">
            <span>BIOGRAPHY</span>
            <h3>About paragraphs</h3>
          </div>
          {about.paragraphs.map((paragraph, index) => (
            <div className="admin-array-card" key={`paragraph-${index}`}>
              <ItemOrderControls
                index={index}
                onMove={(direction) =>
                  mutate((draft) =>
                    moveArrayItem(
                      draft.about.paragraphs,
                      index,
                      direction,
                    ),
                  )
                }
                total={about.paragraphs.length}
              />
              <TextAreaField
                label={`Paragraph ${index + 1}`}
                onChange={(value) =>
                  mutate((draft) => {
                    draft.about.paragraphs[index] = value;
                  })
                }
                rows={3}
                value={paragraph}
              />
              <button
                className="admin-remove-button"
                onClick={() =>
                  mutate((draft) => {
                    draft.about.paragraphs.splice(index, 1);
                  })
                }
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="admin-add-button"
            onClick={() =>
              mutate((draft) => draft.about.paragraphs.push("New paragraph"))
            }
            type="button"
          >
            + Add paragraph
          </button>
        </div>
        <Field
          label="Highlight chips"
          onChange={(value) =>
            mutate(
              (draft) => (draft.about.highlights = splitCommaList(value)),
            )
          }
          placeholder="Machine Learning, Data Science, XAI"
          value={about.highlights.join(", ")}
        />
        <div className="admin-editor-section">
          <div className="admin-subheading">
            <span>INFORMATION CARD</span>
            <h3>Personal details</h3>
          </div>
          {about.info.map((item, index) => (
            <div className="admin-array-card" key={`info-${index}`}>
              <ItemOrderControls
                index={index}
                onMove={(direction) =>
                  mutate((draft) =>
                    moveArrayItem(draft.about.info, index, direction),
                  )
                }
                total={about.info.length}
              />
              <div className="admin-form-grid">
                <Field
                  label="Label"
                  onChange={(label) =>
                    mutate((draft) => {
                      draft.about.info[index].label = label;
                    })
                  }
                  value={item.label}
                />
                <Field
                  label="Value"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.about.info[index].value = value;
                    })
                  }
                  value={item.value}
                />
              </div>
              <label>
                Display type
                <select
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.about.info[index].kind = event.target.value as
                        | "text"
                        | "email"
                        | "status";
                    })
                  }
                  value={item.kind ?? "text"}
                >
                  <option value="text">Normal text</option>
                  <option value="email">Email link</option>
                  <option value="status">Status with green dot</option>
                </select>
              </label>
              <button
                className="admin-remove-button"
                onClick={() =>
                  mutate((draft) => {
                    draft.about.info.splice(index, 1);
                  })
                }
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="admin-add-button"
            onClick={() =>
              mutate((draft) =>
                draft.about.info.push({
                  label: "New detail",
                  value: "Value",
                  kind: "text",
                }),
              )
            }
            type="button"
          >
            + Add detail
          </button>
        </div>
      </EditorShell>
    );
  }

  if (section === "skills") {
    return (
      <EditorShell
        busy={busy}
        description="Create skill tabs, categories, proficiency bars, and technology chips."
        eyebrow="SKILL MATRIX"
        onSave={onSave}
        title="Skills and tools"
      >
        <HeadingFields
          onChange={(heading) =>
            mutate((draft) => (draft.skills.heading = heading))
          }
          value={content.skills.heading}
        />
        {content.skills.groups.length ? (
          content.skills.groups.map((group, groupIndex) => (
            <details
              className="admin-array-card admin-details-card"
              key={`${group.id}-${groupIndex}`}
              open={groupIndex === 0}
            >
              <summary>
                <span>
                  TAB {String(groupIndex + 1).padStart(2, "0")}
                  <strong>{group.label}</strong>
                </span>
                <i>{group.categories.length} categories</i>
              </summary>
              <div className="admin-details-body">
                <ItemOrderControls
                  index={groupIndex}
                  onMove={(direction) =>
                    mutate((draft) =>
                      moveArrayItem(
                        draft.skills.groups,
                        groupIndex,
                        direction,
                      ),
                    )
                  }
                  total={content.skills.groups.length}
                />
                <div className="admin-form-grid">
                  <Field
                    label="Tab ID"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.skills.groups[groupIndex].id =
                          value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                      })
                    }
                    value={group.id}
                  />
                  <Field
                    label="Tab label"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.skills.groups[groupIndex].label = value;
                      })
                    }
                    value={group.label}
                  />
                </div>
                {group.categories.map((category, categoryIndex) => (
                  <div
                    className="admin-nested-card"
                    key={`category-${categoryIndex}`}
                  >
                    <ItemOrderControls
                      index={categoryIndex}
                      onMove={(direction) =>
                        mutate((draft) =>
                          moveArrayItem(
                            draft.skills.groups[groupIndex].categories,
                            categoryIndex,
                            direction,
                          ),
                        )
                      }
                      total={group.categories.length}
                    />
                    <div className="admin-form-grid icon-grid">
                      <Field
                        label="Icon"
                        onChange={(value) =>
                          mutate((draft) => {
                            draft.skills.groups[groupIndex].categories[
                              categoryIndex
                            ].icon = value;
                          })
                        }
                        value={category.icon}
                      />
                      <Field
                        label="Category title"
                        onChange={(value) =>
                          mutate((draft) => {
                            draft.skills.groups[groupIndex].categories[
                              categoryIndex
                            ].title = value;
                          })
                        }
                        value={category.title}
                      />
                    </div>
                    {category.skills.map((skill, skillIndex) => (
                      <div
                        className="admin-skill-row"
                        key={`skill-${skillIndex}`}
                      >
                        <Field
                          label="Skill"
                          onChange={(value) =>
                            mutate((draft) => {
                              draft.skills.groups[groupIndex].categories[
                                categoryIndex
                              ].skills[skillIndex].name = value;
                            })
                          }
                          value={skill.name}
                        />
                        <Field
                          label="Level %"
                          onChange={(value) =>
                            mutate((draft) => {
                              draft.skills.groups[groupIndex].categories[
                                categoryIndex
                              ].skills[skillIndex].level = Math.max(
                                0,
                                Math.min(100, Number(value) || 0),
                              );
                            })
                          }
                          type="number"
                          value={skill.level}
                        />
                        <CompactOrderControls
                          index={skillIndex}
                          onMove={(direction) =>
                            mutate((draft) =>
                              moveArrayItem(
                                draft.skills.groups[groupIndex].categories[
                                  categoryIndex
                                ].skills,
                                skillIndex,
                                direction,
                              ),
                            )
                          }
                          total={category.skills.length}
                        />
                        <button
                          aria-label={`Remove ${skill.name}`}
                          className="admin-icon-button danger"
                          onClick={() =>
                            mutate((draft) => {
                              draft.skills.groups[groupIndex].categories[
                                categoryIndex
                              ].skills.splice(skillIndex, 1);
                            })
                          }
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="admin-inline-actions">
                      <button
                        className="admin-add-button"
                        onClick={() =>
                          mutate((draft) => {
                            draft.skills.groups[groupIndex].categories[
                              categoryIndex
                            ].skills.push({ name: "New skill", level: 70 });
                          })
                        }
                        type="button"
                      >
                        + Add skill
                      </button>
                      <button
                        className="admin-remove-button"
                        onClick={() =>
                          mutate((draft) => {
                            draft.skills.groups[groupIndex].categories.splice(
                              categoryIndex,
                              1,
                            );
                          })
                        }
                        type="button"
                      >
                        Remove category
                      </button>
                    </div>
                    <Field
                      label="Category chips"
                      onChange={(value) =>
                        mutate((draft) => {
                          draft.skills.groups[groupIndex].categories[
                            categoryIndex
                          ].chips = splitCommaList(value);
                        })
                      }
                      placeholder="SHAP Values, LIME Surrogate"
                      value={category.chips.join(", ")}
                    />
                  </div>
                ))}
                <button
                  className="admin-add-button"
                  onClick={() =>
                    mutate((draft) => {
                      draft.skills.groups[groupIndex].categories.push({
                        icon: "✦",
                        title: "New category",
                        skills: [{ name: "New skill", level: 70 }],
                        chips: [],
                      });
                    })
                  }
                  type="button"
                >
                  + Add category
                </button>
                <div className="admin-form-grid">
                  <Field
                    label="Bottom chip heading"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.skills.groups[groupIndex].chipsLabel = value;
                      })
                    }
                    value={group.chipsLabel}
                  />
                  <Field
                    label="Bottom chips"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.skills.groups[groupIndex].chips =
                          splitCommaList(value);
                      })
                    }
                    value={group.chips.join(", ")}
                  />
                </div>
                <button
                  className="admin-remove-button"
                  onClick={() =>
                    mutate((draft) => {
                      draft.skills.groups.splice(groupIndex, 1);
                    })
                  }
                  type="button"
                >
                  Remove entire tab
                </button>
              </div>
            </details>
          ))
        ) : (
          <EmptyHint>No skill tabs yet.</EmptyHint>
        )}
        <button
          className="admin-add-button"
          onClick={() =>
            mutate((draft) => {
              draft.skills.groups.push({
                id: `tab-${draft.skills.groups.length + 1}`,
                label: "New tab",
                categories: [
                  {
                    icon: "✦",
                    title: "New category",
                    skills: [{ name: "New skill", level: 70 }],
                    chips: [],
                  },
                ],
                chipsLabel: "",
                chips: [],
              });
            })
          }
          type="button"
        >
          + Add skill tab
        </button>
      </EditorShell>
    );
  }

  if (section === "recruiter") {
    const recruiter = content.recruiter;
    return (
      <EditorShell
        busy={busy}
        description="Control the recruiter snapshot, proof points, metrics, and hiring call-to-action."
        eyebrow="RECRUITER SNAPSHOT"
        onSave={onSave}
        title="Why hire me"
      >
        <HeadingFields
          onChange={(heading) =>
            mutate((draft) => (draft.recruiter.heading = heading))
          }
          value={recruiter.heading}
        />
        <Field
          label="Core value title"
          onChange={(value) =>
            mutate((draft) => (draft.recruiter.coreTitle = value))
          }
          value={recruiter.coreTitle}
        />
        <TextAreaField
          label="Core value description"
          onChange={(value) =>
            mutate((draft) => (draft.recruiter.coreDescription = value))
          }
          value={recruiter.coreDescription}
        />
        <Field
          label="Proof points"
          onChange={(value) =>
            mutate(
              (draft) =>
                (draft.recruiter.proofPoints = splitCommaList(value)),
            )
          }
          value={recruiter.proofPoints.join(", ")}
        />
        <div className="admin-array-grid">
          <div className="admin-array-card">
            <div className="admin-subheading">
              <span>ACADEMIC METRIC</span>
              <h3>CGPA card</h3>
            </div>
            <div className="admin-form-grid">
              <Field
                label="Large value"
                onChange={(value) =>
                  mutate((draft) => (draft.recruiter.cgpaValue = value))
                }
                value={recruiter.cgpaValue}
              />
              <Field
                label="Small label"
                onChange={(value) =>
                  mutate((draft) => (draft.recruiter.cgpaLabel = value))
                }
                value={recruiter.cgpaLabel}
              />
            </div>
            <TextAreaField
              label="Description"
              onChange={(value) =>
                mutate(
                  (draft) => (draft.recruiter.cgpaDescription = value),
                )
              }
              rows={2}
              value={recruiter.cgpaDescription}
            />
          </div>
          <div className="admin-array-card">
            <div className="admin-subheading">
              <span>RESEARCH METRIC</span>
              <h3>Research card</h3>
            </div>
            <div className="admin-form-grid">
              <Field
                label="Large value"
                onChange={(value) =>
                  mutate((draft) => (draft.recruiter.researchValue = value))
                }
                value={recruiter.researchValue}
              />
              <Field
                label="Small label"
                onChange={(value) =>
                  mutate((draft) => (draft.recruiter.researchLabel = value))
                }
                value={recruiter.researchLabel}
              />
            </div>
            <TextAreaField
              label="Description"
              onChange={(value) =>
                mutate(
                  (draft) => (draft.recruiter.researchDescription = value),
                )
              }
              rows={2}
              value={recruiter.researchDescription}
            />
          </div>
        </div>
        <Field
          label="Growth title"
          onChange={(value) =>
            mutate((draft) => (draft.recruiter.growthTitle = value))
          }
          value={recruiter.growthTitle}
        />
        <TextAreaField
          label="Growth description"
          onChange={(value) =>
            mutate((draft) => (draft.recruiter.growthDescription = value))
          }
          value={recruiter.growthDescription}
        />
        <div className="admin-form-grid">
          <Field
            label="Recognition value"
            onChange={(value) =>
              mutate(
                (draft) => (draft.recruiter.recognitionValue = value),
              )
            }
            value={recruiter.recognitionValue}
          />
          <Field
            label="Recognition label"
            onChange={(value) =>
              mutate(
                (draft) => (draft.recruiter.recognitionLabel = value),
              )
            }
            value={recruiter.recognitionLabel}
          />
        </div>
        <div className="admin-form-grid">
          <Field
            label="CTA small text"
            onChange={(value) =>
              mutate((draft) => (draft.recruiter.ctaKicker = value))
            }
            value={recruiter.ctaKicker}
          />
          <Field
            label="CTA heading"
            onChange={(value) =>
              mutate((draft) => (draft.recruiter.ctaTitle = value))
            }
            value={recruiter.ctaTitle}
          />
        </div>
      </EditorShell>
    );
  }

  if (section === "research") {
    return (
      <EditorShell
        busy={busy}
        description="Add, edit, reorder, or remove research cards and their topic tags."
        eyebrow="RESEARCH CONTENT"
        onSave={onSave}
        title="Research and innovation"
      >
        <HeadingFields
          onChange={(heading) =>
            mutate((draft) => (draft.research.heading = heading))
          }
          value={content.research.heading}
        />
        {content.research.items.map((item, index) => (
          <div className="admin-array-card" key={`research-${index}`}>
            <ItemOrderControls
              index={index}
              onMove={(direction) =>
                mutate((draft) =>
                  moveArrayItem(
                    draft.research.items,
                    index,
                    direction,
                  ),
                )
              }
              total={content.research.items.length}
            />
            <div className="admin-card-number">
              RESEARCH {String(index + 1).padStart(2, "0")}
            </div>
            <div className="admin-form-grid">
              <Field
                label="Status"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.research.items[index].status = value;
                  })
                }
                value={item.status}
              />
              <Field
                label="Title"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.research.items[index].title = value;
                  })
                }
                value={item.title}
              />
            </div>
            <TextAreaField
              label="Description"
              onChange={(value) =>
                mutate((draft) => {
                  draft.research.items[index].description = value;
                })
              }
              value={item.description}
            />
            <Field
              label="Tags"
              onChange={(value) =>
                mutate((draft) => {
                  draft.research.items[index].tags = splitCommaList(value);
                })
              }
              value={item.tags.join(", ")}
            />
            <button
              className="admin-remove-button"
              onClick={() =>
                mutate((draft) => draft.research.items.splice(index, 1))
              }
              type="button"
            >
              Remove research
            </button>
          </div>
        ))}
        <button
          className="admin-add-button"
          onClick={() =>
            mutate((draft) =>
              draft.research.items.push({
                status: "Active Research",
                title: "New research title",
                description: "Describe the problem, approach, and impact.",
                tags: ["AI"],
              }),
            )
          }
          type="button"
        >
          + Add research
        </button>
      </EditorShell>
    );
  }

  if (section === "experience") {
    return (
      <EditorShell
        busy={busy}
        description="Maintain the complete career and academic-project timeline."
        eyebrow="EXPERIENCE TIMELINE"
        onSave={onSave}
        title="Experience"
      >
        <HeadingFields
          onChange={(heading) =>
            mutate((draft) => (draft.experience.heading = heading))
          }
          value={content.experience.heading}
        />
        {content.experience.items.map((item, index) => (
          <div className="admin-array-card" key={`experience-${index}`}>
            <ItemOrderControls
              index={index}
              onMove={(direction) =>
                mutate((draft) =>
                  moveArrayItem(
                    draft.experience.items,
                    index,
                    direction,
                  ),
                )
              }
              total={content.experience.items.length}
            />
            <div className="admin-card-number">
              TIMELINE {String(index + 1).padStart(2, "0")}
            </div>
            <div className="admin-form-grid icon-grid">
              <Field
                label="Icon"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.experience.items[index].icon = value;
                  })
                }
                value={item.icon}
              />
              <Field
                label="Period"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.experience.items[index].period = value;
                  })
                }
                value={item.period}
              />
            </div>
            <div className="admin-form-grid">
              <Field
                label="Role"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.experience.items[index].role = value;
                  })
                }
                value={item.role}
              />
              <Field
                label="Organization"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.experience.items[index].organization = value;
                  })
                }
                value={item.organization}
              />
            </div>
            <TextAreaField
              label="Description"
              onChange={(value) =>
                mutate((draft) => {
                  draft.experience.items[index].description = value;
                })
              }
              value={item.description}
            />
            <button
              className="admin-remove-button"
              onClick={() =>
                mutate((draft) => draft.experience.items.splice(index, 1))
              }
              type="button"
            >
              Remove experience
            </button>
          </div>
        ))}
        <button
          className="admin-add-button"
          onClick={() =>
            mutate((draft) =>
              draft.experience.items.push({
                icon: "💼",
                period: "2026 - Present",
                role: "New role",
                organization: "Organization",
                description: "Describe your work and impact.",
              }),
            )
          }
          type="button"
        >
          + Add experience
        </button>
      </EditorShell>
    );
  }

  if (section === "more") {
    return (
      <EditorShell
        busy={busy}
        description="Edit section headings, workshop, activities, and footer content."
        eyebrow="MORE SECTIONS"
        onSave={onSave}
        title="Projects, certificates and extras"
      >
        <details className="admin-array-card admin-details-card" open>
          <summary>
            <span>
              SECTION HEADINGS
              <strong>Projects and certificates</strong>
            </span>
          </summary>
          <div className="admin-details-body">
            <HeadingFields
              onChange={(heading) =>
                mutate((draft) => (draft.projectsHeading = heading))
              }
              value={content.projectsHeading}
            />
            <HeadingFields
              onChange={(heading) =>
                mutate((draft) => (draft.certificatesHeading = heading))
              }
              value={content.certificatesHeading}
            />
          </div>
        </details>

        <details className="admin-array-card admin-details-card" open>
          <summary>
            <span>
              WORKSHOP
              <strong>{content.workshop.title}</strong>
            </span>
          </summary>
          <div className="admin-details-body">
            <HeadingFields
              onChange={(heading) =>
                mutate((draft) => (draft.workshop.heading = heading))
              }
              value={content.workshop.heading}
            />
            <div className="admin-form-grid icon-grid">
              <Field
                label="Icon"
                onChange={(value) =>
                  mutate((draft) => (draft.workshop.icon = value))
                }
                value={content.workshop.icon}
              />
              <Field
                label="Workshop title"
                onChange={(value) =>
                  mutate((draft) => (draft.workshop.title = value))
                }
                value={content.workshop.title}
              />
            </div>
            <Field
              label="Workshop subtitle"
              onChange={(value) =>
                mutate((draft) => (draft.workshop.subtitle = value))
              }
              value={content.workshop.subtitle}
            />
            {content.workshop.points.map((point, index) => (
              <div className="admin-skill-row" key={`workshop-point-${index}`}>
                <Field
                  label="Icon"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.workshop.points[index].icon = value;
                    })
                  }
                  value={point.icon}
                />
                <Field
                  label="Learning point"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.workshop.points[index].text = value;
                    })
                  }
                  value={point.text}
                />
                <CompactOrderControls
                  index={index}
                  onMove={(direction) =>
                    mutate((draft) =>
                      moveArrayItem(
                        draft.workshop.points,
                        index,
                        direction,
                      ),
                    )
                  }
                  total={content.workshop.points.length}
                />
                <button
                  className="admin-icon-button danger"
                  onClick={() =>
                    mutate((draft) => draft.workshop.points.splice(index, 1))
                  }
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="admin-add-button"
              onClick={() =>
                mutate((draft) =>
                  draft.workshop.points.push({
                    icon: "✦",
                    text: "New learning point",
                  }),
                )
              }
              type="button"
            >
              + Add learning point
            </button>
          </div>
        </details>

        <details className="admin-array-card admin-details-card" open>
          <summary>
            <span>
              ACTIVITIES
              <strong>Beyond the classroom</strong>
            </span>
          </summary>
          <div className="admin-details-body">
            <HeadingFields
              onChange={(heading) =>
                mutate((draft) => (draft.activities.heading = heading))
              }
              value={content.activities.heading}
            />
            {content.activities.items.map((item, index) => (
              <div className="admin-nested-card" key={`activity-${index}`}>
                <ItemOrderControls
                  index={index}
                  onMove={(direction) =>
                    mutate((draft) =>
                      moveArrayItem(
                        draft.activities.items,
                        index,
                        direction,
                      ),
                    )
                  }
                  total={content.activities.items.length}
                />
                <div className="admin-form-grid icon-grid">
                  <Field
                    label="Icon"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.activities.items[index].icon = value;
                      })
                    }
                    value={item.icon}
                  />
                  <Field
                    label="Title"
                    onChange={(value) =>
                      mutate((draft) => {
                        draft.activities.items[index].title = value;
                      })
                    }
                    value={item.title}
                  />
                </div>
                <TextAreaField
                  label="Description"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.activities.items[index].description = value;
                    })
                  }
                  value={item.description}
                />
                <button
                  className="admin-remove-button"
                  onClick={() =>
                    mutate((draft) => draft.activities.items.splice(index, 1))
                  }
                  type="button"
                >
                  Remove activity
                </button>
              </div>
            ))}
            <button
              className="admin-add-button"
              onClick={() =>
                mutate((draft) =>
                  draft.activities.items.push({
                    icon: "✦",
                    title: "New activity",
                    description: "Describe this activity.",
                  }),
                )
              }
              type="button"
            >
              + Add activity
            </button>
          </div>
        </details>

        <details className="admin-array-card admin-details-card">
          <summary>
            <span>
              FOOTER
              <strong>{content.footer.name}</strong>
            </span>
          </summary>
          <div className="admin-details-body">
            <Field
              label="Footer name"
              onChange={(value) =>
                mutate((draft) => (draft.footer.name = value))
              }
              value={content.footer.name}
            />
            <Field
              label="Footer tagline"
              onChange={(value) =>
                mutate((draft) => (draft.footer.tagline = value))
              }
              value={content.footer.tagline}
            />
            <Field
              label="Copyright line"
              onChange={(value) =>
                mutate((draft) => (draft.footer.copyright = value))
              }
              value={content.footer.copyright}
            />
          </div>
        </details>
      </EditorShell>
    );
  }

  const contact = content.contact;
  return (
    <EditorShell
      busy={busy}
      description="Update contact details, location, social profiles, form text, and every CONNECT dock destination."
      eyebrow="CONTACT & SOCIAL"
      onSave={onSave}
      title="Contact information"
    >
      <HeadingFields
        onChange={(heading) =>
          mutate((draft) => (draft.contact.heading = heading))
        }
        value={contact.heading}
      />
      <Field
        label="Contact card title"
        onChange={(value) =>
          mutate((draft) => (draft.contact.title = value))
        }
        value={contact.title}
      />
      <TextAreaField
        label="Contact introduction"
        onChange={(value) =>
          mutate((draft) => (draft.contact.description = value))
        }
        value={contact.description}
      />
      <div className="admin-form-grid">
        <Field
          label="Email"
          onChange={(value) =>
            mutate((draft) => (draft.contact.email = value))
          }
          type="email"
          value={contact.email}
        />
        <Field
          label="Phone"
          onChange={(value) =>
            mutate((draft) => (draft.contact.phone = value))
          }
          type="tel"
          value={contact.phone}
        />
      </div>
      <Field
        label="University / organization"
        onChange={(value) =>
          mutate((draft) => (draft.contact.university = value))
        }
        value={contact.university}
      />
      <div className="admin-form-grid">
        <Field
          label="City"
          onChange={(value) =>
            mutate((draft) => (draft.contact.locationCity = value))
          }
          value={contact.locationCity}
        />
        <Field
          label="Country"
          onChange={(value) =>
            mutate((draft) => (draft.contact.locationCountry = value))
          }
          value={contact.locationCountry}
        />
      </div>
      <Field
        label="Map coordinates text"
        onChange={(value) =>
          mutate((draft) => (draft.contact.coordinates = value))
        }
        value={contact.coordinates}
      />
      <div className="admin-editor-section">
        <div className="admin-subheading">
          <span>SOCIAL PROFILES</span>
          <h3>Cards, footer and floating CONNECT dock</h3>
        </div>
        {content.social.platforms.map((platform, index) => (
          <details
            className="admin-array-card admin-details-card"
            key={`${platform.kind}-${index}`}
            open
          >
            <summary>
              <span>
                {platform.kind.toUpperCase()}
                <strong>{platform.handle}</strong>
              </span>
            </summary>
            <div className="admin-details-body">
              <ItemOrderControls
                index={index}
                onMove={(direction) =>
                  mutate((draft) =>
                    moveArrayItem(
                      draft.social.platforms,
                      index,
                      direction,
                    ),
                  )
                }
                total={content.social.platforms.length}
              />
              <label>
                Platform
                <select
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.social.platforms[index].kind = event.target
                        .value as "github" | "linkedin" | "facebook";
                    })
                  }
                  value={platform.kind}
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                </select>
              </label>
              <div className="admin-form-grid">
                <Field
                  label="Card badge"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].badge = value;
                    })
                  }
                  value={platform.badge}
                />
                <Field
                  label="Display name"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].name = value;
                    })
                  }
                  value={platform.name}
                />
              </div>
              <div className="admin-form-grid">
                <Field
                  label="Handle"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].handle = value;
                    })
                  }
                  value={platform.handle}
                />
                <Field
                  label="Profile URL"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].url = value;
                    })
                  }
                  type="url"
                  value={platform.url}
                />
              </div>
              <TextAreaField
                label="Card description"
                onChange={(value) =>
                  mutate((draft) => {
                    draft.social.platforms[index].description = value;
                  })
                }
                rows={3}
                value={platform.description}
              />
              <div className="admin-form-grid">
                <Field
                  label="First stat value"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].firstStatValue = value;
                    })
                  }
                  value={platform.firstStatValue}
                />
                <Field
                  label="First stat label"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].firstStatLabel = value;
                    })
                  }
                  value={platform.firstStatLabel}
                />
                <Field
                  label="Second stat value"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].secondStatValue = value;
                    })
                  }
                  value={platform.secondStatValue}
                />
                <Field
                  label="Second stat label"
                  onChange={(value) =>
                    mutate((draft) => {
                      draft.social.platforms[index].secondStatLabel = value;
                    })
                  }
                  value={platform.secondStatLabel}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
      <HeadingFields
        onChange={(heading) =>
          mutate((draft) => (draft.social.heading = heading))
        }
        value={content.social.heading}
      />
      <div className="admin-editor-section">
        <div className="admin-subheading">
          <span>CONTACT FORM</span>
          <h3>Input placeholder text</h3>
        </div>
        <div className="admin-form-grid">
          <Field
            label="Name placeholder"
            onChange={(value) =>
              mutate(
                (draft) => (draft.contact.formNamePlaceholder = value),
              )
            }
            value={contact.formNamePlaceholder}
          />
          <Field
            label="Email placeholder"
            onChange={(value) =>
              mutate(
                (draft) => (draft.contact.formEmailPlaceholder = value),
              )
            }
            value={contact.formEmailPlaceholder}
          />
          <Field
            label="Subject placeholder"
            onChange={(value) =>
              mutate(
                (draft) => (draft.contact.formSubjectPlaceholder = value),
              )
            }
            value={contact.formSubjectPlaceholder}
          />
          <Field
            label="Message placeholder"
            onChange={(value) =>
              mutate(
                (draft) => (draft.contact.formMessagePlaceholder = value),
              )
            }
            value={contact.formMessagePlaceholder}
          />
        </div>
      </div>
    </EditorShell>
  );
}
